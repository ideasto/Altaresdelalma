"""Local static server matching frontend/vercel.json: files first, SPA fallback.
No deployment or external preview; only for production-build validation.
"""
import argparse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote

parser=argparse.ArgumentParser();parser.add_argument('--root',required=True);parser.add_argument('--port',type=int,default=3100);args=parser.parse_args()
root=Path(args.root).resolve()
class SPA(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw): super().__init__(*a,directory=str(root),**kw)
 def send_head(self):
  requested=(root/unquote(urlsplit(self.path).path).lstrip('/')).resolve()
  if not requested.is_relative_to(root): self.send_error(403);return None
  if not requested.is_file(): self.path='/index.html'
  return super().send_head()
 def log_message(self,*a): pass
ThreadingHTTPServer(('127.0.0.1',args.port),SPA).serve_forever()
