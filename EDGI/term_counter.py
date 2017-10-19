import requests
import csv
from web_monitoring.differs import _get_visible_text as gvt # import Dan Allan's page content decoder
def count(term, content): # this function counts terms from the decoded HTML
    visible_text = gvt(content)
    term = term.lower()  # normalize so as to make result case insensitive
    tally = 0
    for section in visible_text:
        for token in section.split():
            tally += int(term in token.lower())
    return tally

sum=0 # total count of term
page_count=0 # count of pages that had available snapshots
page_sum=0 # sum of term for a specific page
term = 'climate' # the term to count
file = 'urls.csv' # this is the file Anastasia produced after crawling /statelocalclimate
statuses.append(version.status_code)
with open(file) as csvfile: 
    read = csv.reader(csvfile)
    for row in read:
        try:
            dump = list_versions(row[0], datetime(2016, 11, 1), datetime(2017, 1, 19)) # list_versions calls the CDX API from internetarchive.py from the webmonitoring repo and returns an iterator object of snapshots from the specified timeframe
            versions = reversed(list(dump)) # start from the most recent snapshots
            for version in versions: # for each version in all the snapshots 
                if version.status_code != '200': # if the IA snapshot was a redirect or page not found, move to the next snapshot version
                    pass
                else: #if the IA snapshot represents a page, try to decode it
                    try:
                        url=version.raw_url # the url of the IA snapshot
                        contents = requests.get(url).content.decode() #decode the url's HTML
                        page_sum = count(term, contents) # count the term 
                        sum += page_sum # add the page's sum to the overall sum
                        page_count += 1 # count the page
                        break
                    except:
                        print('decoding error', version.status_code, row[0])# this will capture errors in decoding a page
                        break
        except:
            print('IA error', row[0]) # this will capture errors where IA has no records.
csvfile.close()
print (sum, page_count, page_sum)