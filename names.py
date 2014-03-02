from collections import defaultdict
import string
import json
from datetime import datetime
from matplotlib import pyplot as plt

try:
	from mpltools import style
	style.use('ggplot')
except:
	pass

with open('words.json', 'rb') as fp:
   d = json.load(fp)
		
gangsters = ['attackers','gunman','gunmen','thugs','armed','robbers']
terrorists = ['terrorist','terrorists','terrorism','terror','alshabab','shabab','shabaab','alshabaab','al-shabab','islamist','islam']
c = dict()
for y in d:
	for h in d[y]:
		date = ' '.join(str(y).split('-')) +" "+ str(h)
		if date not in c:
			c[date] = defaultdict(int)
		for t,v in d[y][h]:
			if t in terrorists:
				c[date]['Terrorists'] += v
				continue
			if t in gangsters:
				c[date]['Gangsters'] += v
				continue
				
c = sorted(c.iteritems(),key = lambda (k,v) : k)
terror, gang = [], []
for key,d in c:
	for k in ['Terrorists','Gangsters']:
		if k in d:
			v = d[k]
		else:
			v = 0
		if k == 'Terrorists':
			terror.append(v)
		if k == 'Gangsters':
			gang.append(v)

plt.plot(terror[:21],label = 'Terrorists')
plt.plot(gang[:21],label = 'Gangsters')
plt.legend()
plt.show()

with open('names.json','wb') as fp:
	json.dump(c,fp)