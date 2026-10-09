import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

if(!process.env.IMAGEKIT_PUBLIC_KEY && !process.env.IMAGEKIT_PRIVATE_KEY && !process.env.IMAGEKIT_URL_ENDPOINT){
        throw new Error("imagekit key config is not define in evironment variables")
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export default imagekit
