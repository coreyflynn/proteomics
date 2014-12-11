import re
import sys
import csv
import os
from pymongo import MongoClient
from pymongo.collection import Collection
from bson.objectid import ObjectId

if len(sys.argv) != 2:
    print ("Usage: python import.py <file>")
    print ("")
    print ("file - a tab-delimited maxquant file to be ingested into the mongo database")
    quit()

def numberize(s):
    try:
        return int(s)
    except:
        try:
            return float(s)
        except:
            return s


pathname = os.path.dirname(sys.argv[1])
filename = os.path.basename(sys.argv[1]).split('.')[0]

# Connects to the Mongo client
client = MongoClient('localhost', 27017)
experiments = client.proteomics.experiments
collection = Collection(client.proteomics, filename)

# Gets the path name without the extension
path = {"path": pathname}

# If the exp exists, add to it instead of creating a new one
try:
  result = experiments.find_one(path)
  id = result['_id']
except:
  print("No known experiment. Adding...")
  id = experiments.insert(path)

# Snag the ID
criteria = {}
criteria['_id'] = ObjectId(id)

if filename != "parameters":
    for lineNum, line in enumerate(csv.reader(open(sys.argv[1], "rt"), delimiter='\t')):

        if lineNum == 0:
	    headers = line
	    for index, header in enumerate(headers):
		headers[index] = header.lower()
        else:
            JSO = {}
            for index, column in enumerate(line):

                # Determine whether array or singular piece of data.
                regexp = re.compile('[;]')
                if regexp.search(column) is not None:
                    column = re.split('[;]', column)
                    for item in column:
                        item = numberize(item)
                else:
                    column = numberize(column)


                JSO[headers[index].translate(None, '!@#$.')] = column
            JSO['expID'] = id
            collection.insert(JSO)
else:
    toAdd = []
    for lineNum, line in enumerate(csv.reader(open(sys.argv[1], "rt"), delimiter='\t')):

        if lineNum == 0:
            headers = line
        else:
            JSO = {line[0].translate(None, '!@#$.'):numberize(line[1])}
            toAdd.append(JSO)
    set = {'$set': {filename:toAdd}}
    experiments.update(criteria, set)
