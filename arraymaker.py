__author__ = 'mbewley'

import urllib2
import json
#url = "http://biocache.ala.org.au/ws/occurrences/search?wkt=POLYGON((149.927%20-33.854,151.064%20-34.337,151.493%20-33.699,150.038%20-33.392,149.927%20-33.854))&q=matched_name:%22Strepera%20graculina%22&fq=rank:species&flimit=17000&pageSize=17000&foffset=0&&facets=names_and_lsid"
#
#response = urllib2.urlopen(url)
#j = json.load(response)
#f = open('data.json', 'wb')
#json.dump(j, f, indent=2)
#f.close()
with open('data.json', 'rb') as f:
    j = json.load(f)
print j['occurrences'][0]

outData = []
for o in j['occurrences']:
    try:
        outData.append([o['uuid'], o['eventDate']] + [float(x) for x in o['latLong'].split(',')])
    except KeyError:
        pass
outData = zip(*outData)
outData = {'uuid': outData[0], 'eventDate':outData[1], 'latitude':outData[2], 'longitude':outData[3]}
with open('latlon.json', 'wb') as f:
    json.dump(outData, f, indent=2)