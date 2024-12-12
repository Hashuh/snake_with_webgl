
//顶点对象
function pic_vao_gen(gl, programInfo){
	
	//buffers
	const VAO_pic = gl.createVertexArray();
	gl.bindVertexArray(VAO_pic);
	const VBO_pic = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, VBO_pic);
	{
	let pic = [
		1.0, 1.0, 	1.0, 1.0,
		-1.0, 1.0,	0.0, 1.0,
		-1.0, -1.0,	0.0, 0.0,
		
		1.0, 1.0, 	1.0, 1.0,
		-1.0, -1.0,	0.0, 0.0,
		1.0, -1.0,	1.0, 0.0,
		];//立方体顶点数据
			
		
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pic), gl.STATIC_DRAW);
	}

		
	
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexPosition,
		2,
		gl.FLOAT,
		false,
		16,
		0,
	);
	gl.vertexAttribPointer(
		programInfo.attribLocations.coordPosition,
		2,
		gl.FLOAT,
		false,
		16,
		8,
	);

	gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
	gl.enableVertexAttribArray(programInfo.attribLocations.coordPosition);
	
	
	return VAO_pic;
}