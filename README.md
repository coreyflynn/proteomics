<h1>Proteomics Data Crawler</h1>

This is a full-stack application that ingests data into a MongoDB database, acts as an API layer, 
and will eventually be an entire front-end servelet as well. The goal is to provide Broad Insititute 
employees in the proteomics division with easy access to data regarding previous experiments.

<h3>Ingestion</h3>
<hr>
Files ```ingest.py``` and ```bulkIngest.py``` are used to take in MaxQuant text files and parse them
into MongoDB-readable documents. They're split into collections based on the title of the file, and referenced
using an 'expID' to the experiments collection. The experiments are referenced by the parent directory of the
text files.

<b>bulkIngest.py</b>
```
USAGE: python bulkIngest.py <root directory>
root directory - the origin directory in which all files to be ingested will be contained.
```
Essentially calls ingest.py for every text file found.

<b>ingest.py</b>
```
USAGE: python bulkIngest.py <file>
file - the text file to be ingested into MongoDB.
```
Parses the textfile into Mongo

<h3>API</h3>
<hr>
The API is created with the Node.js MVC framework, and utilizes Express.js. It allows a user (or front-end application) 
to access the data in Mongo securely and efficiently. One can add query parameters, return fields, distinct keys, 
and set specific collections to be queried.

<b>Example URL</b>

```http://(DNS of box):3000/search?col=[]&q={}&r={}&d=```
```
col (optional): ex - col=["evidence","peptides"]
                A string array of the collections to query. Non-existent collection names will be ignored.
                If omitted, will default to querying all collections.
q  (mandatory): ex - q={"gene names":"ACTC"}
                An object containing query parameters to match against. Also known as "WHERE" condition.
r   (optional): ex - r={"protein names":1,"_id":0}
                An object containing boolean values of whether or not to include said fields. Defaults to
                showing all fields.
d   (optional): ex - d=gene names
                DOES NOT USE QUOTES. Overrides r param, returns only given field, and only distinct values
                of that field.
```
