import urllib2, urllib
import json
from sqlalchemy.orm import scoped_session, sessionmaker
import sqlalchemy
from sqlalchemy import or_
from models import Tweet, URL, Base
'''import Image
from PIL import ImageChops'''
from multiprocessing import Pool
from multiprocessing.dummy import Pool as ThreadPool

#API
from instagram.client import InstagramAPI
from instagram.bind import InstagramAPIError, InstagramClientError
from twython import Twython
from twython.exceptions import TwythonError

engine = sqlalchemy.create_engine('sqlite:////Users/imperal/Projects/InfoVis/SQLite.db')
engine.raw_connection().connection.text_factory = str
Session = scoped_session(sessionmaker(bind=engine))
s = Session()


# Social connections
access_token = "YOUR_ACCESS_TOKEN"
api = InstagramAPI(access_token=access_token)

APP_KEY = ''
APP_SECRET = ''
twitter = Twython(APP_KEY, APP_SECRET, oauth_version=2)
ACCESS_TOKEN = twitter.obtain_access_token()
twitter = Twython(APP_KEY, access_token=ACCESS_TOKEN)

def take_url(imageURL):
	session2 = Session()
	imageURL = session2.merge(imageURL)
	imageName = ''

	# Count the retweets (naive way)
	count = 0
	for tweet in imageURL.tweets:
		count = count + len(tweet.retweets) + 1 #the tweet itself also
	if count > 10:

		if 'instagram' in imageURL.longAddress:
			try:
				req = urllib2.Request("http://api.instagram.com/oembed?url="+imageURL.longAddress)
				response = urllib2.urlopen(req)
				response = json.loads(response.read())
				print response['media_id']
				media = api.media(media_id=response['media_id'])
				imageName = media.images['standard_resolution'].url
			except (InstagramAPIError, urllib2.HTTPError, InstagramClientError):
				print "ni"
				pass

		elif 'twitter' in imageURL.longAddress:
			status_id = imageURL.longAddress.split('/')[-3]
			print status_id
			try:
				imageName = twitter.show_status(id=status_id)['entities']['media'][0]['media_url_https']
			except TwythonError, e:
				if e.error_code == 404:
					imageURL.title = "a"
					session2.commit()
				pass
		
		if imageName != '':
			

			urllib.urlretrieve(imageName, 'images/'+str(count)+"_"+str(imageURL.ID)+"."+imageName.split('.')[-1])
			print count

	
	imageURL.title = "a"
	session2.commit()
	session2.close()


imagesURLs = s.query(URL).filter(or_(URL.longAddress.like("%instagram.com%"), URL.longAddress.like("%/photo/1"))).filter(URL.title==None).all()
pool = ThreadPool(2)
placesContent = pool.map(take_url, imagesURLs)



'''for imageURL in imagesURLs:
	print imageURL.longAddress'''

	




'''
def equal(im1, im2):
    return ImageChops.difference(im1, im2).getbbox() is None
'''





