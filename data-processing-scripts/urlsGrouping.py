import urllib2
import urllib
import httplib
import json
import re
from models import Tweet, URL, Base
from sqlalchemy.orm import scoped_session, sessionmaker
from multiprocessing import Pool
from multiprocessing.dummy import Pool as ThreadPool

import os.path

import sqlalchemy

engine = sqlalchemy.create_engine('sqlite:////Users/denadai2/Google Drive/InfoVis/Data processing/SQLite.db')
engine.raw_connection().connection.text_factory = str
Session = scoped_session(sessionmaker(bind=engine))
session = Session()

def is_ascii(s):
	return all(ord(c) < 128 for c in s)

def take_url(row):
	session2 = Session()
	row = session2.merge(row)
	try:
		print row.shortAddress
		req = urllib2.Request("http://expandurl.me/expand?url="+row.shortAddress)
		response = urllib2.urlopen(req)
		response = json.loads(response.read())
		if response["status"] == "InvalidURL" or response["end_url"] == row.shortAddress or not is_ascii(response["end_url"]):
			session2.delete(row)
		else:
			endURL = response["end_url"]
			#
			# If the url is already in the DB, the analyzed link will be deleted and the 
			# association will be added to the other one
			#
			fetchedURL = session2.query(URL).filter(URL.longAddress==endURL).first()
			if fetchedURL:
				print "merged"
				fetchedURL.tweets.extend(row.tweets)
				session2.commit()
				session2.delete(row)
			else:
				#
				# The long link needs to be checked. Maybe it gives a 404 error
				#
				try:
					req = urllib2.Request(endURL)
					response = urllib2.urlopen(req)
					row.longAddress = endURL
				except (urllib2.URLError, httplib.BadStatusLine) as e:
					session2.delete(row)

				
	except (urllib2.URLError, UnicodeEncodeError) as e:
		session2.delete(row)

	
	session2.commit()
	session2.close()

def countTweets(url):
	count = 0
	for tweet in url.tweets:
		count = count + len(tweet.retweets) + 1 #the tweet itself also

	return count


'''urls = session.query(URL).filter(URL.longAddress==None).all()
session.close()
pool = ThreadPool(15)
placesContent = pool.map(take_url, urls)'''


urls = session.query(URL).filter(URL.longAddress.contains("youtube")).all()
for url in urls:
	temp = re.compile(r"^(http[s]?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/(.+)v=([^&#]+)(.+)?$", re.IGNORECASE).split(url.longAddress)
	if len(temp) > 4:
		print url.longAddress

		#merge urls
		address = "https://www.youtube.com/watch?v="+temp[4]
		fetchedURL = session.query(URL).filter(URL.longAddress==address).filter(URL.ID!=url.ID).first()
		if fetchedURL:
			count = countTweets(url)
			filename = 'videoScreenshots/'+str(count)+"_"+str(url.ID)+"_"+temp[4]+".jpg"
			if os.path.isfile(filename):
				os.remove(filename)

			fetchedURL.tweets.extend(url.tweets)
			session.commit()
			session.delete(url)
			url = fetchedURL
		else:
			url.longAddress = address
			session.commit()

		count = countTweets(url)
		filename = 'videoScreenshots/'+str(count)+"_"+str(url.ID)+"_"+temp[4]+".jpg"
		urllib.urlretrieve('https://img.youtube.com/vi/'+temp[4]+'/0.jpg', filename)




