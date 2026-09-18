import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "enwlpozz",
  api_key: process.env.CLOUDINARY_API_KEY || "676424772427112",
  api_secret: process.env.CLOUDINARY_API_SECRET || "Gj93-nrNpQPvJelmSN2mewHrgBY",
  secure: true,
});

export default cloudinary;
