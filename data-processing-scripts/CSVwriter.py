import csv,codecs,cStringIO
import datetime
from models import Tweet, URL, Base
from sqlalchemy.orm import sessionmaker

import sqlalchemy

engine = sqlalchemy.create_engine('sqlite:////Users/denadai2/Google Drive/InfoVis/Data processing/SQLite.db')
engine.raw_connection().connection.text_factory = str
Session = sessionmaker(bind=engine)
session = Session()

class UnicodeWriter:
    def __init__(self, f, dialect=csv.excel, encoding="utf-8-sig", **kwds):
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()
    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8") for s in row])
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        data = self.encoder.encode(data)
        self.stream.write(data)
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)


fout = open("output.csv", "wb")
c = UnicodeWriter(fout)
c.writerow(["username","text","timestamp","lat","lng"])

tweets = session.query(Tweet).order_by(Tweet.ID).all()

for tweet in tweets:
	print tweet.username

	if tweet.lat == 0.0 and tweet.lng == 0.0:
		tweet.lat = ""
		tweet.lng = ""
	
	if tweet.parent_ID == None:
		c.writerow([tweet.username, tweet.text, datetime.datetime.strftime(tweet.timestamp, "%Y-%m-%dT%H:%M:%S.000Z"), str(tweet.lat), str(tweet.lng)])
	else:
		c.writerow([tweet.username, "RT @"+tweet.parentTweet.username+": "+tweet.parentTweet.text, 
			datetime.datetime.strftime(tweet.timestamp, "%Y-%m-%dT%H:%M:%S.000Z"), str(tweet.lat), str(tweet.lng)])