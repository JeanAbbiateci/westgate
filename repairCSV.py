import csv
import re
import codecs
import datetime
import sqlalchemy
from models import Tweet, URL, Base
from sqlalchemy.orm import relationship, backref, sessionmaker
 
engine = sqlalchemy.create_engine('sqlite:///foo.db')
engine.raw_connection().connection.text_factory = str

Session = sessionmaker(bind=engine)
session = Session()

def is_ascii(s):
	return all(ord(c) < 128 for c in s)

Base.metadata.create_all(engine)

with codecs.open('../../Dropbox/processed_tweets_kenya.txt', 'rU', encoding='utf-8', errors='ignore') as tsvin:

		count = 0
		for row in tsvin:
				row = row.split('\t')
				if len(row) == 7:
					username, text, timestamp, pos1, pos2, lat, lng = row
					parentTweet = None

					#
					# If the timestamp is invalid, the database is not so consistent
					# Also trick to remove faulty rows that have correct timestamp but
					# are not split in the right way.
					#
					if len(timestamp) != 24:
						continue

					#
					# delete the quotes
					#
					text = text.replace("\"", "")

					#
					# If there is no location
					#
					if len(lat) == 0:
						lat = 0
						lng = 0


					textToInsert = text
					textToSearch = text
					userToSearch = None
					while re.match(r"(RT|via) +@([^ :]+):? (.+)", textToSearch) != None:
						rt_patterns = re.compile(r"(RT|via) +@([^ :]+):? (.+)", re.IGNORECASE).split(textToSearch)
						textToSearch = rt_patterns[-2]
						userToSearch = rt_patterns[-3]

					#
					# If there is a retweet, it needs to be found
					#
					if userToSearch:
						foundTweet = session.query(Tweet).filter(Tweet.username==userToSearch).filter(Tweet.parent_ID==None).filter(Tweet.text.startswith(textToSearch[:10])).first()
						#
						# Sometimes it can happen that the retweeter modifies the tweet. Let's try to "fix" it
						#
						if not foundTweet:
							tweetsFromTheUser = session.query(Tweet).filter(Tweet.username==userToSearch).filter(Tweet.parent_ID==None).all()
							if len(tweetsFromTheUser) == 1:
								parentTweet = tweetsFromTheUser[0].ID
								textToInsert = None
						else:
							parentTweet = foundTweet.ID
							textToInsert = None
					

					u = Tweet(username, textToInsert, datetime.datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S.000Z"), float(lat), float(lng), parentTweet)
					session.add(u)
					session.commit()

					#
					# if it's not a retweet
					#
					if not parentTweet:
						links = re.findall(r"http:\/\/t.co\/[a-zA-Z0-9\-\.]+", text)
						if links:
							#
							# let's remove the duplicates
							#
							links = list(set(links))
							for link in links:
								#
								# if it's a real link
								#
								if is_ascii(link):
									fetchedURL = session.query(URL).filter(URL.shortAddress==link).first()
									if not fetchedURL:
										l = URL(link, u.ID)
										session.add(l)
										fetchedURL = l
									
									fetchedURL.tweets.append(u)

					

					session.commit()
					count += 1
					if count % 1000 == 0:
						print "processed "+str(count)+" tweets"