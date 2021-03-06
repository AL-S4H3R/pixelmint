import type { NextPage } from 'next'
import { LegacyRef, useEffect, useRef, useState } from 'react'
import { Box, Button, Heading, HStack, Icon, Img, Input, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stack, Text, Textarea, VStack } from '@chakra-ui/react'
import { HiCloudUpload } from 'react-icons/hi'
import { useWeb3React } from '@web3-react/core'
import { injected, walletConnect } from '../src/providers/DAppProvider'
import { create } from 'ipfs-http-client'
import { ethers } from 'ethers'
import { ABI, DEPLOYED_ADDRESS } from '../src/utils/contract'

const Home: NextPage = () => {
	
	const [preview, setPreview] = useState('')
	const [finalImage, setFinalImage] = useState('')
	const [tokenUri, setTokenUri] = useState('')
	const [pixels, setPixels] = useState(40)
	const [openseaUrl, setOpenseaUrl] = useState('')
	const [loading, setLoading] = useState(false)

	const fileInputRef = useRef<HTMLInputElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const titleInputRef = useRef<HTMLInputElement>(null)
	const descriptionInputRef = useRef<HTMLTextAreaElement>(null)
	
	const { activate, active, account, library } = useWeb3React()

	useEffect(() => {
		// @ts-ignore
		renderCanvas(canvasRef.current)
	}, [preview, canvasRef, pixels])

	const connectMobile = async () => {
		setLoading(true)
		try {
			await activate(walletConnect)
		}
		catch(err){
			console.log(err)
		}
		setLoading(false)
	}

	const connectBrowser = async () => {
		setLoading(true)
		try {
			await activate(injected)
		}
		catch(err){
			console.log(err)
		}
		setLoading(false)
	}

	const renderCanvas = (canvas: HTMLCanvasElement) => {
		const ctx = canvas.getContext('2d')
		if(ctx){
			const pixelRatio = pixels / 128
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

	const uploadToIpfs = async (bufferImage: Blob) => {
        const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })
		// const bufferImage = URL.createObjectURL(new Blob([finalImage]))
		// console.log(bufferImage)
		const name = titleInputRef.current?.value
		const description = descriptionInputRef.current?.value
		
		if(name && description){
			const { cid: imageCid } = await client.add(bufferImage)
			console.log(imageCid.toString())
			const metadata = {
				name,
				description,
				image: `ipfs://${imageCid.toString()}`
			}
			const file = new Blob([JSON.stringify(metadata)],{ type: 'application/json' })
			const { cid } = await client.add(file)
			console.log(cid.toString())
			return `ipfs://${cid.toString()}`
		}
    }

	const mintNft = async () => {
		let tokenUri: string
		canvasRef.current?.toBlob(async (blob) => {
			if(blob){
				// @ts-ignore
				tokenUri = await uploadToIpfs(blob!)
				setLoading(true)
				const signer = await library.getSigner()
				const contract = new ethers.Contract(DEPLOYED_ADDRESS, ABI, signer)
				console.log(contract)
				const tx = await contract.safeMint(account, tokenUri)
				if(tx){
					const receipt = await tx.wait()
					if(receipt){
						console.log('Receipt: ', receipt)
						const tokenId = ethers.BigNumber.from(receipt.events[0].args[2]).toString()
						const opensea = `https://testnets.opensea.io/assets/mumbai/0xc3655d30081fce15ee346cbce1c86cb40338b810/${tokenId}`
						setOpenseaUrl(opensea)
						setLoading(false)
						// console.log('Token id: ', ethers.BigNumber.from(receipt.events[0].args[2]).toString())
					}
				}
			}
		})
		setLoading(false)
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
						<Button w={"full"} onClick={(e) => {
							e.preventDefault()
							fileInputRef.current?.click()
						}}>
							Change Image
						</Button>
					</Stack>
				}
			</Box>
			<Stack px={{ base: 4 }} py={{ base: 4 }} spacing={'4'}>
				<Slider value={pixels} onChange={(e) => setPixels(e)}>
					<SliderTrack>
						<Box position={'relative'} right={10}/>
						<SliderFilledTrack />
					</SliderTrack>
					<SliderThumb boxSize={6}/>
				</Slider>
				<Input type={'text'} placeholder={'Name your NFT'} border={'2px'} ref={titleInputRef}/>
				<Textarea placeholder='Describe your NFT' ref={descriptionInputRef}/>
			</Stack>
			<Stack px={{ base: 4 }} spacing={4}>
				<Button disabled={!active} onClick={mintNft} isLoading={loading}>
					{ active ? 'Generate NFT' : 'Please connect your wallet'}
				</Button>
				{
					openseaUrl !== '' &&
					<Button bgColor={'blue.500'} color={'white'} as='a' href={openseaUrl}>
						View on Opensea
					</Button>
				}
			</Stack>
		</Box>
	)
}

export default Home