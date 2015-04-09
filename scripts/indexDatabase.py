import pymongo
from bson.objectid import ObjectId

# Connects to the Mongo client
client = pymongo.MongoClient('localhost', 27017)
evidence = client.proteomics.evidence
peptides = client.proteomics.peptides
modPeps  = client.proteomics.modificationSpecificPeptides
proteins = client.proteomics.proteinGroups

index = [("expID",pymongo.ASCENDING),("modified sequence",pymongo.ASCENDING),("sequence",pymongo.ASCENDING),("proteins",pymongo.ASCENDING)]

print("Indexing evidence table...")
evidence.ensure_index(index)
print("Done!")

print("Indexing peptides table...")
peptides.ensure_index(index)
print("Done!")

print("Indexing modificationSpecificPeptides table...")
modPeps.ensure_index(index)
print("Done!")

print("Indexing proteinGroups table...")
proteins.ensure_index(index)
print("Done!")
