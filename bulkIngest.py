import sys
import os
from subprocess import call

for dirname, dirnames, filenames  in os.walk(sys.argv[1]):
  for filename in filenames:
    if (filename.endswith('.txt')):
      print('Making call to ' + filename)
      call(['python', './ingest.py', os.path.join(dirname, filename)])
