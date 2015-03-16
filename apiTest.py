import urllib2
import json

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

print('== LEGACY SEARCH '.ljust(width, '='))

# 
intro = 'Testing /search...'
print(intro),
try:
    result = urllib2.urlopen('http://massive.broadinstitute.org:3000/search?q={}')
    print(PASS + good.rjust(width-len(intro)-1) + ENDC)

except:
    print(FAIL + fail.rjust(width-len(intro)-1) + ENDC)


## Fast search

print('== RESTRUCTURED COLLECTIONS '.ljust(width, '='))

# Genes
intro = 'Testing /search/genes...'
print(intro),
try:
    urllib2.urlopen('http://massive.broadinstitute.org:3000/search/genes').read()
    print(PASS + good.rjust(width-len(intro)-1) + ENDC)
except:
    print(FAIL + fail.rjust(width-len(intro)-1) + ENDC)

# Modified Sequences
intro = 'Testing /search/modseqs...'
print(intro),
try:
    urllib2.urlopen('http://massive.broadinstitute.org:3000/search/modseqs').read()
    print(PASS + good.rjust(width-len(intro)-1) + ENDC)
except:
    print(FAIL + fail.rjust(width-len(intro)-1) + ENDC)

# Proteins
intro = 'Testing /search/proteins...'
print(intro),
try:
    urllib2.urlopen('http://massive.broadinstitute.org:3000/search/proteins').read()
    print(PASS + good.rjust(width-len(intro)-1) + ENDC)
except:
    print(FAIL + fail.rjust(width-len(intro)-1) + ENDC)