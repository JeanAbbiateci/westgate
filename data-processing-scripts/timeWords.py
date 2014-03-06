import urllib
from sqlalchemy.orm import scoped_session, sessionmaker
import sqlalchemy

from collections import defaultdict
from nltk.corpus import stopwords
import string
import json
import re


engine = sqlalchemy.create_engine('sqlite:///sqlite.db')
engine.raw_connection().connection.text_factory = str
Session = scoped_session(sessionmaker(bind=engine))
s = Session()

stopwords = set(stopwords.words('english'))
remove_punctuation_map = dict((ord(Char), None) for Char in string.punctuation)

content = s.execute("SELECT username, date(timestamp),strftime('%H',timestamp), text, parent_ID FROM Tweet")
d = dict()
i = 0
re_links = re.compile(r'^http?:\/\/.*[\r\n]*',flags = re.MULTILINE)
re_mention = re.compile(r'(?<=^|(?<=[^a-zA-Z0-9-_\.]))@([A-Za-z]+[A-Za-z0-9]+)', flags = re.IGNORECASE | re.VERBOSE | re.MULTILINE)
mentions = defaultdict(int)
for row in content:
	if row[4]:
		result = s.execute("SELECT username, date(timestamp),strftime('%H',timestamp), text, parent_ID FROM Tweet WHERE id = '{}'".format(row[4]))
		r = result.fetchone()
		if r[1] not in mentions:
			mentions[r[1]] = dict()
		if r[2] not in mentions[r[1]]:
			mentions[r[1]][r[2]] = defaultdict(int)
		mentions[r[1]][r[2]][r[0]] += 1
		text = r[3]
	else:
		text = row[3]
	date = str(row[1])
	hour = str(row[2])
	if date not in d:
		d[date] = dict()
	if hour not in d[date]:
		d[date][hour] = defaultdict(int)
	
	for mention in re.findall(re_mention,text):
		if date not in mentions:
			mentions[date] = dict()
		if hour not in mentions[date]:
			mentions[date][hour] = defaultdict(int)
		mention = mention.strip('@')
		mentions[date][hour]

	text = re.sub(re_mention, "", text)
	text = re.sub(re_links, "", text)
	text = filter(lambda w: not w in string.digits,text)
	text = filter(None, (word.strip(string.punctuation) for word in text.lower().split()))
	text = filter(lambda w: not w in stopwords,text)
	for w in text:
		if len(w) > 3:
			d[date][hour][w] += 1
	i += 1
	if (i % 10000) == 0:
		print i
s.close()
for day in d.keys():
	for hour in d[day].keys():
		d[day][hour] = {k : v for k,v in d[day][hour].iteritems() if v > 10}
		d[day][hour] = sorted(d[day][hour].iteritems(), key = lambda (k,v) : v, reverse = True)

for day in mentions.keys():
	for hour in mentions[day].keys():
		mentions[day][hour] = {k : v for k,v in mentions[day][hour].iteritems() if v > 10}
		mentions[day][hour] = sorted(mentions[day][hour].iteritems(), key = lambda (k,v) : v, reverse = True)

with open('words.json', 'wb') as fp:
    json.dump(d, fp)
		
with open('mentions.json', 'wb') as fp:
	  json.dump(mentions, fp)