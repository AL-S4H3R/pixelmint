import type { NextPage } from 'next'
import { LegacyRef, useEffect, useRef, useState } from 'react'
import { Box, Button, Heading, HStack, Icon, Img, Input, Stack, Text, Textarea, VStack } from '@chakra-ui/react'
import { HiCloudUpload } from 'react-icons/hi'
import { useWeb3React } from '@web3-react/core'
import { injected, walletConnect } from '../src/providers/DAppProvider'

const Home: NextPage = () => {
	
	const [preview, setPreview] = useState('')
	const [finalImage, setFinalImage] = useState('')
	
	const fileInputRef = useRef<HTMLInputElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const titleInputRef = useRef<HTMLInputElement>(null)
	const descriptionInputRef = useRef<HTMLTextAreaElement>(null)
	
	const { activate, active, account } = useWeb3React()

	useEffect(() => {
		// @ts-ignore
		renderCanvas(canvasRef.current)
	}, [preview, canvasRef])

	const connectMobile = async () => {
		try {
			await activate(walletConnect)
		}
		catch(err){
			console.log(err)
		}
	}

	const connectBrowser = async () => {
		try {
			await activate(injected)
		}
		catch(err){
			console.log(err)
		}
	}

	const renderCanvas = (canvas: HTMLCanvasElement) => {
		const ctx = canvas.getContext('2d')
		if(ctx){
			const pixelRatio = 120 / 128
			let w = 500 * pixelRatio
			let h = 500 * pixelRatio
			const img = new Image()
			img.src = preview
			ctx.imageSmoothingEnabled = false
			img.onload = async () => {
				await ctx.drawImage(img, 0, 0, w, h)
				const result = await ctx.drawImage(canvas, 0, 0, w, h, 0, 0, 500, 500)
				// @ts-ignore
				const pixelatedImage = canvas.toDataURL()
				console.log(pixelatedImage)
				setFinalImage(pixelatedImage)
			}
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
				<Heading letterSpacing={'wider'}>pixel.mint</Heading>
				{
					active && account ?
					<Text>{account?.slice(0,9)}...{account?.slice(-9)}</Text> :
					<Button onClick={connectMobile}>Connect Wallet</Button> 
				}
			</HStack>
			{
				!finalImage &&
				<Box px={{ base: 4}} py={{ base: 4}}>
					<VStack border={'4px'} borderStyle={'dotted'} py={{base: 4}} onClick={(e) => {
						e.preventDefault()
						fileInputRef.current?.click()
					}}>
						<Icon as={HiCloudUpload} fontSize={'8xl'}/>
						<Text>Please upload your image to pixelate</Text>
					</VStack>
				</Box>
			}
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
			<Box px={{ base: 4}}>
				<canvas
					// @ts-ignore 
					ref={canvasRef}
					height={500}
					width={500}
					style={{ display: 'none' }}
				/>
				{
					finalImage &&
					<Stack>
						<Img src={finalImage} width={'full'} h={'full'} rounded={'xl'}/>
						<Button w={"full"}>Change Image</Button>
					</Stack>
				}
			</Box>
			<Stack px={{ base: 4 }} py={{ base: 4 }} spacing={'4'}>
				<Input type={'text'} placeholder={'Name your NFT'} border={'2px'} ref={titleInputRef}/>
				<Textarea placeholder='Describe your NFT' ref={descriptionInputRef}/>
			</Stack>
			<Stack px={{ base: 4 }}>
				<Button disabled={!active}>Generate NFT</Button>
			</Stack>
		</Box>
	)
}

export default Home