from pymongo import MongoClient
from pymongo.collection import Collection

# Connects to the Mongo client
client = MongoClient('localhost', 27017)
client.proteomics.experiments.drop()
client.proteomics.evidence.drop()
client.proteomics.modificationSpecificPeptides.drop()
client.proteomics.peptides.drop()
client.proteomics.proteinGroups.drop()
