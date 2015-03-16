import urllib2
import json
import timeit

good = '[PASS]'
fail = '[FAIL]'
PASS = '\033[92m'
WARN = '\033[93m'
FAIL = '\033[91m'
ENDC = '\033[0m'

def getTerminalSize():
    import os
    env = os.environ
    def ioctl_GWINSZ(fd):
        try:
            import fcntl, termios, struct, os
            cr = struct.unpack('hh', fcntl.ioctl(fd, termios.TIOCGWINSZ, '1234'))
        except:
            return
        return cr
    cr = ioctl_GWINSZ(0) or ioctl_GWINSZ(1) or ioctl_GWINSZ(2)
    if not cr:
        try:
            fd = os.open(os.ctermid(), os.O_RDONLY)
            cr = ioctl_GWINSZ(fd)
            os.close(fd)
        except:
            pass
    if not cr:
        cr = (env.get('LINES', 25), env.get('COLUMNS', 80))
    return int(cr[1]), int(cr[0])

(width, height) = getTerminalSize()

################
# Begin tests! #
################

## Legacy search

print
print('== LEGACY COLLECTIONS '.ljust(width, '='))

#
intro = 'Testing /search...'
print(intro),
try:
    result = urllib2.urlopen('http://massive.broadinstitute.org:3000/search?q={}', timeout=5)
    print(PASS + good.rjust(width-len(intro)-1) + ENDC)
    data = json.load(result)

    print('--Evidence..................'),
    if len(data['evidence']) > 0:
        print(PASS + good + ENDC)
    else:
        print(FAIL + fail + ENDC)

    print('--ModSpecificPeptides.......'),
    if len(data['modificationSpecificPeptides']) > 0:
        print(PASS + good + ENDC)
    else:
        print(FAIL + fail + ENDC)

    print('--Peptides..................'),
    if len(data['peptides']) > 0:
        print(PASS + good + ENDC)
    else:
        print(FAIL + fail + ENDC)

    print('--ProteinGroups.............'),
    if len(data['proteinGroups']) > 0:
        print(PASS + good + ENDC)
    else:
        print(FAIL + fail + ENDC)

except:
    print(FAIL + fail.rjust(width-len(intro)-1) + ENDC)


## Restructured search

print
print('== RESTRUCTURED COLLECTIONS '.ljust(width, '='))

# Genes
intro = 'Testing /search/genes...'
print(intro),
try:
    urllib2.urlopen('http://massive.broadinstitute.org:3000/search/genes', timeout=5).read()
    print(PASS + good.rjust(width-len(intro)-1) + ENDC)
except:
    print(FAIL + fail.rjust(width-len(intro)-1) + ENDC)

# Modified Sequences
intro = 'Testing /search/modseqs...'
print(intro),
try:
    urllib2.urlopen('http://massive.broadinstitute.org:3000/search/modseqs', timeout=5).read()
    print(PASS + good.rjust(width-len(intro)-1) + ENDC)
except:
    print(FAIL + fail.rjust(width-len(intro)-1) + ENDC)

# Proteins
intro = 'Testing /search/proteins...'
print(intro),
try:
    urllib2.urlopen('http://massive.broadinstitute.org:3000/search/proteins', timeout=5).read()
    print(PASS + good.rjust(width-len(intro)-1) + ENDC)
except:
    print(FAIL + fail.rjust(width-len(intro)-1) + ENDC)


## Timing samples

print
print('== TIMING SAMPLES '.ljust(width, '='))

# Legacy
print('Legacy with open params:'.ljust(20)),
time = timeit.Timer("urllib2.urlopen('http://massive.broadinstitute.org:3000/search?q={}', timeout=60)","import urllib2").timeit(1)
print(str(time) + ' s')

print('Legacy with specific params:'.ljust(20)),
try:
    time = timeit.Timer("urllib2.urlopen('http://massive.broadinstitute.org:3000/search?q={\"gene%20names\":\"ACTG\"}', timeout=60)","import urllib2").timeit(1)
    print(str(time) + ' s')
except:
    print(FAIL + 'request timed out!' + ENDC)

print

# Restructured
print('Genes with open params:'.ljust(20)),
try:
    time = timeit.Timer("urllib2.urlopen('http://massive.broadinstitute.org:3000/search/genes', timeout=60)","import urllib2").timeit(1)
    print(str(time) + ' s')
except:
    print(FAIL + 'request timed out!' + ENDC)

print('Genes with specific params:'.ljust(20)),
try:
    time = timeit.Timer("urllib2.urlopen('http://massive.broadinstitute.org:3000/search/genes?q={\"gene%20names\":\"ACTG\"}', timeout=60)","import urllib2").timeit(1)
    print(str(time) + ' s')
except:
    print(FAIL + 'request timed out!' + ENDC)

print('Modified sequences with open params:'.ljust(20)),
try:
    time = timeit.Timer("urllib2.urlopen('http://massive.broadinstitute.org:3000/search/modseqs', timeout=60)","import urllib2").timeit(1)
    print(str(time) + ' s')
except:
    print(FAIL + 'request timed out!' + ENDC)

print('Modified sequences with specific params:'.ljust(20)),
try:
    time = timeit.Timer("urllib2.urlopen('http://massive.broadinstitute.org:3000/search/modseqs?q={\"modifiedSequence\":\"_(AC)AAAAAAAAAAGDSDSWDADTFSMEDPVRK_\"}', timeout=60)","import urllib2").timeit(1)
    print(str(time) + ' s')
except:
    print(FAIL + 'request timed out!' + ENDC)

print('Proteins with open params:'.ljust(20)),
try:
    time = timeit.Timer("urllib2.urlopen('http://massive.broadinstitute.org:3000/search/proteins', timeout=60)","import urllib2").timeit(1)
    print(str(time) + ' s')
except:
    print(FAIL + 'request timed out!' + ENDC)

print('Proteins with specific params:'.ljust(20)),
try:
    time = timeit.Timer("urllib2.urlopen('http://massive.broadinstitute.org:3000/search/proteins?q={\"protein\":\"Q91YE6\"}', timeout=60)","import urllib2").timeit(1)
    print(str(time) + ' s')
except:
    print(FAIL + 'request timed out!' + ENDC)

print

