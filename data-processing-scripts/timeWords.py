import urllib
from sqlalchemy.orm import scoped_session, sessionmaker
import sqlalchemy

from collections import defaultdict
from nltk.corpus import stopwords
import string
import json
import re


engine = sqlalchemy.create_engine('sqlite:///../SQLite.db')
engine.raw_connection().connection.text_factory = str
Session = scoped_session(sessionmaker(bind=engine))
s = Session()

content = s.execute("SELECT username, date(timestamp),strftime('%H',timestamp), text, parent_ID FROM Tweet")

i = 0
total = 0
tags = set()
for row in content:
	if row[4]:
		continue
	text = row[3]

	for word in text.split():
		if word.startswith('#'):
			word.strip('#')
			for tag in word.split('#'):
				tags.add(tag)
	if (i % 10000) == 0:
		print i

s.close()
print tags