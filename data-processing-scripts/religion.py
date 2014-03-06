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
		
religion = ['religion','religious','god','christianity','christ','jesus','allah','pray','prayers','muslim','islam']
terrorism = ['terrorism','terrorist','terrorists','jihad','bomb','suicide','alshabab','shabab','shabaab','alshabaab','al-shabab','al-shabaab','al-qaida','al-qaeda','somalia']
hostages = ['hostage','hostages','trapped','civilian','civilians']

c = dict()
for y in d:
	for h in d[y]:
		date = ' '.join(str(y).split('-')) +" "+ str(h)
		if date not in c:
			c[date] = defaultdict(int)
		for t,v in d[y][h]:
			if t in religion:
				c[date]['religion'] += v
				continue
			if t in terrorism:
				c[date]['terrorism'] += v
				continue
			if t in hostages:
				c[date]['hostages'] += v
				continue

b = sorted(c.iteritems(),key = lambda (k,v) : k)
r, t, h = [], [], []
for key,d in b:
	for k in ['religion','terrorism','hostages']:
		if k in d:
			v = d[k]
		else:
			v = 0
		if k == 'religion':
			r.append(v)
		if k == 'terrorism':
			t.append(v)
		if k == 'hostages':
			h.append(v)
print h
plt.plot(r,label = 'Religion')
plt.plot(t,label = 'Terrorism')
plt.plot(h,label = 'Hostages')
plt.legend()
plt.show()

with open('religionVSterror.json','wb') as fp:
	json.dump(c,fp)