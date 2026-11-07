// Browser-only validation harness: compiled separately, never imported by the app.
import * as db from '../../frontend/src/lib/db';
import * as storage from '../../frontend/src/lib/storage';
import { lettersPdf } from '../../frontend/src/lib/pdf/letters';
import { bookPdf } from '../../frontend/src/lib/pdf/book';
import { deckPdf } from '../../frontend/src/lib/pdf/deck';
import { timelinePdf } from '../../frontend/src/lib/pdf/timeline';
import { galleryPdf } from '../../frontend/src/lib/pdf/gallery';
window.ecos = { ...db, ...storage, lettersPdf, bookPdf, deckPdf, timelinePdf, galleryPdf };
