//Character Counter validation
/*
If your React app uses a rich-text editor, the :content field will contain HTML tags (like <p><b>...</b></p>). If you validate the length of the HTML, 
a user might only type 10 words but hit the limit because of the hidden code.

Best Practice: Your React app should send both the content (for rendering) and the text
 (plain string). We validate the length of the plain string to be fair to the user.
*/

const limits = { post: 280, voice: 1000 };
const [category, setCategory] = useState('post');
const [text, setText] = useState('');

const remaining = limits[category] - text.length;

return (
  <div>
    <textarea onChange={(e) => setText(e.target.value)} />
    <span className={remaining < 0 ? "text-red-500" : "text-gray-400"}>
      {remaining} characters left
    </span>
  </div>
);

/*
json:
{
  "errors": {
    "text": ["for voice posts cannot exceed 1000 characters"]
  }
}
*/