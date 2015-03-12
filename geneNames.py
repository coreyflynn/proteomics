import re
import sys
import csv
import os
import json
from pymongo import MongoClient
from pymongo.collection import Collection
from bson.objectid import ObjectId

# Connects to the Mongo client
client = MongoClient('localhost', 27017)
evidence = client.proteomics.evidence
geneNames = client.proteomics.geneNames

# For each gene, use this process to see if it exists.
def process (geneName, expid, modifiedSequence, intensity, mods):

    res = geneNames.find({"gene":geneName})

    # Does gene exist?

    if res.count() == 0:
    # No - create new document for gene
        print("New gene found: " + geneName)

        obj = {"gene":geneName, "modifiedSequences":{}}
        obj["modifiedSequences"][modifiedSequence] = {expid:{}}

        if intensity != "":
            obj["modifiedSequences"][modifiedSequence][expid]['intensity'] = [intensity]
        else:
            obj["modifiedSequences"][modifiedSequence][expid]['intensity'] = []

        obj["modifiedSequences"][modifiedSequence][expid]['modifications'] = [mods]
            
        geneNames.insert(obj)

    else:
    # Yes - append to gene document
        obj = res[0]

        # Does the modification exist?
        if modifiedSequence in obj["modifiedSequences"]:
        # if hasattr(obj["modifications"], modifiedSequence):
        # Yes

            # Does the experiment exist?
            if expid in obj["modifiedSequences"][modifiedSequence]:

            # Yes
                key = "modifiedSequences." + modifiedSequence + "." + expid
                toPush = {key + '.intensity':intensity}
                if mods not in obj['modifiedSequences'][modifiedSequence][expid]['modifications']:
                    toPush[key + '.modifications'] = mods
                geneNames.update({"gene":geneName}, {'$push':toPush})

            else:

            # No
                key = "modifiedSequences." + modifiedSequence + "." + expid
                toPush = {key + '.intensity':[intensity]}
                toPush[key + '.modifications'] = [mods]
                geneNames.update({"gene":geneName}, {'$set':toPush})

        else:
        # No
            key = "modifiedSequences." + modifiedSequence
            toPush = {key:{expid:{intensity:[intensity]}}}
            toPush[key][expid]['modifications'] = [mods]
            print ("Trying to push " + str(toPush))
            geneNames.update({"gene":geneName}, {'$set':toPush})


geneNames.drop()

# Loop through all gene names in the experiment collection.

for document in evidence.find({},{"expID":1,"gene names":1,"modified sequence":1,"intensity":1}).batch_size(30):
    if (isinstance(document["gene names"], list)):
        for gene in document["gene names"]:
            process(gene.upper(),str(ObjectId(document["expID"])),document["modified sequence"],document["intensity"],document['modifications'])
    else:
        process(document["gene names"].upper(),str(ObjectId(document["expID"])),document["modified sequence"],document["intensity"],document['modifications'])