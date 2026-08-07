import PixelWave from './PixelWave';
import mainImage from './assets/main.jpg';

function App() {
  return (
    <div>
<PixelWave imageUrl={mainImage} pixelSize={5} />
    </div>
  );
}

export default App;