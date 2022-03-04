import { createCanvas, loadImage } from 'canvas'

interface IFormat {
    width: number;
    height: number;
    smoothing: boolean
}

interface IPixelFormat {
    ratio: number
}

const format: IFormat = {
    width: 512,
    height: 512,
    smoothing: false,
}

const pixelFormat: IPixelFormat = {
    ratio: 2 / 128,
}

const canvas = createCanvas(format.width, format.height)
const ctx = canvas.getContext('2d')

export const draw = (_imgObject: any) => {
    let size = pixelFormat.ratio;
    let w = canvas.width * size;
    let h = canvas.height * size;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(_imgObject.loadedImage, 0, 0, w, h);
    const final = ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    return final
}