
import sys
import pymongo
import json

# Prepare query
if len(sys.argv) is not 2:
    print ("Usage: python batch_search.py <file>")
    sys.exit()

seqs = []

file = open(sys.argv[1],'r')
for line in file:
    sequence = line.replace('\n', '')
    seqs.append({'sequence': {'$regex': sequence}})
query = {'$or':seqs}

# Connect to Mongo
client = pymongo.MongoClient('localhost', 27017)
modSeqs = client.proteomics.modifiedSequences

results = []
count = 0

for result in modSeqs.find(query,{'_id':0}):
    results.append(result)
    count = count + 1
results.append({'count':count})
print(json.dumps(results, sort_keys = False, indent = 4))
