import json
import requests
 
def example(latitude, longitude):

	base = "http://open.mapquestapi.com/nominatim/v1/reverse.php?"
	params = "format=json&lat={lat}&lon={lon}".format(
	lat=latitude,
	lon=longitude
	)
	url = "{base}{params}".format(base=base, params=params)
	headers = {'Accept-Language': 'en'}
	response = requests.get(url, headers=headers)
	print latitude, longitude
	
	
	response = response.json()
	#print response
	place = []

	if 'city' in response['address']:
		place.append(response['address']['city'])

	if 'state' in response['address']:
		place.append(response['address']['state'])

	if 'country' in response['address']:
		place.append(response['address']['country'])
	
	cache[latitude+"_"+longitude] = ', '.join([x for x in place])
	return cache[latitude+"_"+longitude]


json_data=open('locations.json')

data = json.load(json_data)
json_data.close()
cache = {}

outArray = []

for row in data['RECORDS']:

	if row["lng"]+"_"+row["lat"] in cache:
		print "hit"
		placeName = cache[row["lng"]+"_"+row["lat"]]
	else:
		placeName = example(row["lng"],row["lat"])

	outArray.append( (row['Time'], row["lat"], row["lng"], row["number_of_tweets"], placeName) )
	

with open('compressed.json', 'w') as outfile:
	json.dump(outArray, outfile)

