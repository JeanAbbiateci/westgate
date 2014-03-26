from sqlalchemy.orm import scoped_session, sessionmaker
import sqlalchemy

import collections

import json


engine = sqlalchemy.create_engine('sqlite:///SQLite.db')
engine.raw_connection().connection.text_factory = str
Session = scoped_session(sessionmaker(bind=engine))
s = Session()

i = 0

word = [("shabaab", "shabab", "shebab"), "terrorists", ("gunmen", "gun men"), "thugs", "militants", "gang", "jihadis", "murderers", "islamists"]

#rowarray_list = []
#for i in range(len(word)):
#    result = s.execute("SELECT date(timestamp),count(*) from Tweet WHERE text LIKE '%" + word[i] +"%' GROUP BY date(timestamp)")
#    for row in result:
#        print row
#        t = (word[i], row[0], row[1])
#        rowarray_list.append(t)
#
#                 
#j = json.dumps(rowarray_list)
#rowarrays_file = 'student_rowarrays.json'
#f = open(rowarrays_file,'wb')
#print f, j


rowarray_list = []
objects_list = []
objects_dates_list = []
c_list = []
total_list = []
for i in range(len(word)):
    query1 = "SELECT date(timestamp),count(*) from Tweet WHERE "
    query3 = "GROUP BY date(timestamp)"
    if isinstance(word[i], basestring):
        result = s.execute(query1 + "text LIKE '%" + word[i] +"%' " + query3)
    else:
        query2 = ""
        for j in range(len(word[i])):
            query2 = query2 + "text LIKE '%" + word[i][j] +"%' OR "
        result = s.execute(query1 + query2[:-3] + query3)
        
    d = collections.OrderedDict()
    d['word'] = word[i]
    for row in result:
        # for json1
        rowarray_list.append(row[1])
        #for json2
        c_list.append(row[1])
    
    # for json1  
    #for masked where there is no entry for final day
    if len(rowarray_list)<5:
        rowarray_list.append(0) 
    d['occurs'] = rowarray_list
    rowarray_list = []
    objects_list.append(d)
    
    #for json2
    #for masked where there is no entry for final day
    if len(c_list)<5:
        c_list.append(0)
    total_list.append(c_list)
    c_list = []
     
    
        
with open('wordsDay.json', 'wb') as fp:
	  json.dump(objects_list, fp)




total_words = 0
dates_list = ["2013-09-21","2013-09-22","2013-09-23","2013-09-24","2013-09-25"]

for k in range(len(dates_list)):
    for j in range(len(total_list)):
        total_words += total_list[j][k]
    
    
    d1 = collections.OrderedDict()
    d1['date'] = dates_list[k]
    d1['occurs'] = total_words
    objects_dates_list.append(d1)
    total_words = 0

with open('wordsDayTotal.json', 'wb') as fp:
	  json.dump(objects_dates_list, fp)

	  

#
#rowarray_list = []
#objects_list = []
#for i in range(len(word)):
#    result = s.execute("SELECT date(timestamp),count(*) from Tweet WHERE text LIKE '%" + word[i] +"%' GROUP BY date(timestamp)")
#    for row in result:
#        print row
#        t = (word[i], row[0], row[1])
#        rowarray_list.append(t)
#        
##j = json.dumps(objects_list)
##objects_file = 'lala.json'
##f = open(objects_file,'wb')
##print f, j
#
#
#d = defaultdict(int)
#
##print rowarray_list
#for k, v, p in rowarray_list:
#    d[v] += p
#
#with open('wordsDayTotal.json', 'wb') as fp:
#	  json.dump(d, fp)
#
#d2 = defaultdict(list)
#
#for k, v, p in rowarray_list:
#    d2[k].append([v,p])
#
#d2.items()
#with open('wordsDay.json', 'wb') as fp:
#	  json.dump(d2, fp)
#print d2
#s.close()