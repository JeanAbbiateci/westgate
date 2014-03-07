
from sqlalchemy import Table, Column, Integer, String, ForeignKey, DateTime, Float, UnicodeText
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref

Base = declarative_base()

class Tweet(Base):
	__tablename__ = 'Tweet'

	ID = Column(Integer, primary_key=True)
	username = Column(UnicodeText, index=True)
	text = Column(UnicodeText)
	timestamp = Column(DateTime)
	lat = Column(Float)
	lng = Column(Float)
	parent_ID = Column(Integer, ForeignKey('Tweet.ID'))

	parentTweet = relationship("Tweet", remote_side=ID)
	retweets = relationship("Tweet", remote_side=parent_ID)

	def __init__(self, username, text, timestamp, lat, lng, parent_ID):
		self.username = username
		self.text = text
		self.timestamp = timestamp
		self.lat = lat
		self.lng = lng
		self.parent_ID = parent_ID


	def __repr__(self):
		return "<Tweet(username='%s', text='%s', timestamp='%s')>" % (self.username, self.text, self.timestamp)


association_table = Table('association', Base.metadata,
    Column('tweet_ID', Integer, ForeignKey('Tweet.ID')),
    Column('URL_ID', Integer, ForeignKey('URL.ID'))
)

class URL(Base):
	__tablename__ = 'URL'

	ID = Column(Integer, primary_key=True)
	shortAddress = Column(String, unique=True)
	longAddress = Column(String)
	title = Column(String)

	tweets = relationship("Tweet", secondary=association_table)


	def __init__(self, short, tweet_ID):
		self.shortAddress = short
		self.longAddress = None
		self.tweet_ID = tweet_ID
		self.title = None


	def __repr__(self):
		return "<URL(address='%s')>" % (self.shortAddress)




