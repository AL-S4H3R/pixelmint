import type { NextPage } from 'next'
import Image from 'next/image'
import { useState } from 'react'
import { draw } from '../src/utils/pixelate'

const Home: NextPage = () => {
	
	const [file, setFile] = useState<any>()
	
	const fileChangeHandler = (files: FileList | null) => {
		if(files){
			const pixelatedFile = draw(files[0])
			setFile(pixelatedFile)
		}
	}

	return(
		<>
			<input type="file" onChange={(e) => {fileChangeHandler(e.target.files)}}/>
			{ file && <Image src={file}/> }
		</>
	)
}

export default Home