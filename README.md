# Muxy - Encode Smarter 🚀

Muxy is a **next-gen media conversion library** that seamlessly converts **images and videos** into the most popular formats with **speed and efficiency**. Whether you’re working with **images** (JPEG, PNG, WebP) or **videos** (H.264, H.265, AV1, VP8, VP9, HLS, DASH), Muxy has got you covered.

---

## ✨ Features

✅ **Universal Image Converter** – Convert any image format to **JPEG, PNG, WebP**.  
✅ **Advanced Video Encoding** – Supports **H.264, H.265, AV1, VP8, VP9**.  
✅ **Adaptive Streaming Ready** – Convert videos to **HLS & DASH** for seamless streaming.  
✅ **Blazing Fast Performance** – Optimized for speed and efficiency.  
✅ **Simple API** – Easy-to-use functions for quick media conversion.  
✅ **Lightweight & Scalable** – Designed to work smoothly across applications.  


---

## 📦 Installation

### Install Muxy via **pnpm**
```sh
pnpm install @aikonlabs/muxy
```

or using **npm**
```sh
npm install @aikonlabs/muxy
```

or using **Yarn**
```sh
yarn add @aikonlabs/muxy
```


## 🚀 Quick Start

### Convert an Image
```ts
import { convertImage } from '@aikonlabs/muxy';

await convertImage('input.jpg', 'output.png');
```


### Convert a Video
```ts
import { convertVideo } from '@aikonlabs/muxy';

await convertVideo('input.mp4', 'output.mp4', { codec: 'h265' });

```

### Convert a Video to HLS
```ts
import { convertToHLS } from '@aikonlabs/muxy';

await convertToHLS('input.mp4', 'hls_output', { codec: 'h265' });

```