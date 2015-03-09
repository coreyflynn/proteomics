import re
import sys
import csv
import os
import json
from pymongo import MongoClient
from pymongo.collection import Collection
from bson.objectid import ObjectId

#  Example data structure for geneNames
#
#  {
#    gene: "ACTG",
#    modifiedSequences: {
#      _AGFAGDDAPR_: {
#        54be605e7ab3f3896a57df79:{
#          intensity: [120320000, 324640000],
#          modifications: [mod1, mod2]
#      }
#    }
#  }
#

#  Example data structure for modifications
#
#  {
#    modifiedSequence: "_AGFAGDDAPR_"
#    experiments: {
#      54be605e7ab3f3896a57df79: {
#        intensity: [120320000, 324640000],
#        modifications: [mod1, mod2]
#      }
#    }
#  }
#


# Connects to the Mongo client
client = MongoClient('localhost', 27017)
evidence = client.proteomics.evidence
modSeqs = client.proteomics.modifiedSequences

# For each gene, use this process to see if it exists.
def process (expid, modifiedSequence, intensity, mods):

    criteria = {"modifiedSequence":modifiedSequence}
    res = modSeqs.find(criteria)

    # Does gene exist?

    if res.count() == 0:
    # No - create new document for mod
        print("New mod found: " + modifiedSequence)

        obj = {"modifiedSequence":modifiedSequence, "experiments":{}}
        if intensity != "":
            obj["experiments"][expid] = {"intensity":[intensity], "modifications": [mods]}
        else:
            obj["experiments"][expid] = {"intensity":[], "modifications": [mods]}
        modSeqs.insert(obj)

    else:
    # Yes - append to mod document
        obj = res[0]
        key = "experiments." + str(expid)
        toPush = {}

        if intensity != "":
            toPush[key + ".intensity"] = intensity
        else:
            toPush[key + ".intensity"] = []

        if mods not in obj['experiments'][expid]['modifications']:
            toPush[key + ".modifications"] = mods



        # Does the experiment exist?
        if expid in obj['experiments']:
        # Yes
            modSeqs.update(criteria, {'$push':toPush})

        else:
        # No
            modSeqs.update(criteria, {'$set':toPush})

modSeqs.drop()

# Loop through all gene names in the experiment collection.

for document in evidence.find({},{"expID":1,"modified sequence":1,"intensity":1,"modifications":1}).batch_size(30):
        process(str(ObjectId(document["expID"])),document["modified sequence"].upper(),document["intensity"], document["modifications"])