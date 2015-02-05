<h1>Proteomics Data Crawler</h1>

This is a full-stack application that ingests data into a MongoDB database, acts as an API layer, 
and will eventually be an entire front-end servelet as well. The goal is to provide Broad Insititute 
employees in the proteomics division with easy access to data regarding previous experiments.

<h3>API</h3>
<hr>
The API is created with the Node.js MVC framework, and utilizes Express.js. It allows a user (or front-end application) 
to access the data in Mongo securely and efficiently. One can add query parameters, return fields, distinct keys, 
and set specific collections to be queried.

<b>Example URL</b>

```http://(DNS of box):3000/search?col=[]&q={}&f={}&r=&d=```
<hr>
<b>Q</b>uery
```
q  (mandatory): ex - q={"gene names":"ACTC"}
                An object containing query parameters to match against. Also known as "WHERE" condition.
                (REGEX EXAMPLE
                q={"gene names":{"$regex":"ACT"}}
                Equates to: "Show me every document where any gene name contains ACT"
                Examples of things it will return: ACT ACTA ACTA1 CACTUS
```
<hr>
<b>C</b>ollections to query
```
col (optional): ex - col=["evidence","peptides"]
                A string array of the collections to query. Non-existent collection names will be ignored.
                If omitted, will default to querying all collections
```
<hr>
<b>F</b>ields to return
```
f   (optional): ex - f={"protein names":1,"sequence":1,"_id":0}
                An object containing boolean values (can use 1/0 or true/false) of whether or not to
                include said fields. Example says "show me protein names and sequence fields, but not the
                _id field" Defaults to showing all fields.
```
<hr>
<b>D</b>istinct values of a key
```
d   (optional): ex - d=gene names
                DOES NOT USE QUOTES. Overrides f param, returns only given field, and only distinct
                values of that key.
```



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
