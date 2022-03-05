import type { NextPage } from 'next'
import { LegacyRef, useEffect, useRef, useState } from 'react'
import { Box, Button, Heading, HStack, Icon, VStack } from '@chakra-ui/react'
import { HiCloudUpload } from 'react-icons/hi'

const Home: NextPage = () => {
	
	const [preview, setPreview] = useState('')
	
	const fileInputRef = useRef<HTMLInputElement>()
	const canvasRef = useRef<LegacyRef<HTMLCanvasElement>>()

	useEffect(() => {
		renderCanvas(canvasRef.current!)
	}, [preview, canvasRef])

	const renderCanvas = (canvas: LegacyRef<HTMLCanvasElement>) => {
		// @ts-ignore
		const ctx = canvas.getContext('2d')
		const pixelRatio = 12 / 128
		let w = 500 * pixelRatio
		let h = 500 * pixelRatio
		const img = new Image()
		img.src = preview
		ctx.imageSmoothingEnabled = false
		img.onload = async () => {
			await ctx.drawImage(img, 0, 0, w, h)
			const result = await ctx.drawImage(canvas, 0, 0, w, h, 0, 0, 500, 500)
			console.log(result)
		}
	}

	const uploadImage = (image: File) => {
		const fileReader = new FileReader()
		fileReader.onloadend = () => {
			const imgUrl = fileReader.result as string
			setPreview(imgUrl)
		}
		fileReader.readAsDataURL(image)
	}

	return(
		<Box overflowX={'hidden'}>
			<HStack px={{ base: 4 }} py={{ base: 4 }} justifyContent={'space-between'}>
				<Heading>pixel.mint</Heading>
				<Button>Connect Wallet</Button>
			</HStack>
			<Box px={{ base: 4}} py={{ base: 4}}>
				<VStack border={'4px'} borderStyle={'dotted'} as='button' onClick={(e) => {
					e.preventDefault()
					fileInputRef.current?.click()
				}}>
					<Icon as={HiCloudUpload}/>
				</VStack>
			</Box>
			<input 
				type="file" 
				accept='img/*'
				style={{ display: 'none' }} 
				// @ts-ignore
				ref={fileInputRef}
				onChange={(e) => {
					// @ts-ignore
					const file = e.target.files[0]
					if(file && file.type.substring(0, 5) === 'image'){
						uploadImage(file)
					}
				}}
			/>
			{/* <img src={canvasPreview} width="250" height={'250'}/> */} 
				<canvas
					// @ts-ignore 
					ref={canvasRef}
					height={500}
					width={500}
				/>
		</Box>
	)
}

export default Home