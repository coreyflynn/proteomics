import re
import sys
import csv
import os
from pymongo import MongoClient
from pymongo.collection import Collection
from bson.objectid import ObjectId


pathname = os.path.dirname(sys.argv[1])
filename = os.path.basename(sys.argv[1]).split('.')[0]

# Connects to the Mongo client
client = MongoClient('localhost', 27017)
evidence = client.proteomics.evidence
geneNames = client.proteomics.geneNames

for document in evidence.find({},{"expID":1,"gene names":1}).limit(5):
  print(document)
