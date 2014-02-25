import urllib2
import json
from models import Tweet, URL, Base
from sqlalchemy.orm import scoped_session, sessionmaker
from multiprocessing import Pool
from multiprocessing.dummy import Pool as ThreadPool

import sqlalchemy

engine = sqlalchemy.create_engine('sqlite:///foo.db')
engine.raw_connection().connection.text_factory = str
Session = scoped_session(sessionmaker(bind=engine))
session = Session()


'''req = urllib2.Request('http://expandurl.me/expand?url=http://t.co/sE8sjDVasd')
response = urllib2.urlopen(req)
print json.loads(response.read())["end_url"]'''

def take_url(row):
	session2 = Session()
	row = session2.merge(row)
	try:
		print row.shortAddress
		req = urllib2.Request("http://expandurl.me/expand?url="+row.shortAddress)
		response = urllib2.urlopen(req)
		response = json.loads(response.read())
		if response["status"] == "InvalidURL":
			session2.delete(row)
		else:
			endURL = response["end_url"]
			#
			# if the url is already in the DB:
			#
			fetchedURL = session2.query(URL).filter(URL.longAddress==endURL).first()
			if fetchedURL != None:
				print "merged"
				fetchedURL.tweets.extend(row.tweets)
				session2.commit()
				session2.delete(row)
			else:
				row.longAddress = endURL
				
	except urllib2.URLError, UnicodeEncodeError:
		session2.delete(row)

	
	session2.commit()
	session2.close()


urls = session.query(URL).filter(URL.longAddress==None).all() #.offset(25000).limit(10000)
session.close()
pool = ThreadPool(10)
placesContent = pool.map(take_url, urls)
'''for row in urls:
	if len(row.shortAddress)>11 and is_ascii(row.shortAddress):
		try:
			print row.shortAddress
			req = urllib2.Request("http://expandurl.me/expand?url="+row.shortAddress)
			response = urllib2.urlopen(req)
			row.longAddress = json.loads(response.read())["end_url"]
			session.commit()
		except urllib2.URLError, UnicodeEncodeError:
			session.delete(row)
			continue
	else:
		session.delete(row)'''

