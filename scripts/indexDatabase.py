from pymongo import MongoClient
from pymongo.collection import Collection
from bson.objectid import ObjectId

# Connects to the Mongo client
client = MongoClient('localhost', 27017)
evidence = client.proteomics.evidence
peptides = client.proteomics.peptides
modPeps  = client.proteomics.modificationSpecificPeptides
proteins = client.proteomics.proteinGroups

index = {"expID":1,"modified sequence":1,"sequence":1,"proteins":1}

print("Indexing evidence table...")
evidence.ensureIndex(index)
print("Done!")

print("Indexing peptides table...")
peptides.ensureIndex(index)
print("Done!")

print("Indexing modificationSpecificPeptides table...")
modPeps.ensureIndex(index)
print("Done!")

print("Indexing proteinGroups table...")
proteins.ensureIndex(index)
print("Done!")
