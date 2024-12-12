
//顶点对象
function food_vao_gen(gl, programInfo, num_row){
	
	const size = 1.0 / num_row;
	const init_offset = -1.0 / num_row + 1.0;
	//buffers
	const VAO = gl.createVertexArray();
	gl.bindVertexArray(VAO);
	const VBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
	{
	let food = [
		0.0, 1.0,
		-1.0, 0.0,
		0.0, -1.0,
		
		0.0, 1.0,
		0.0, -1.0,
		1.0, 0.0,
	];//立方体顶点数据
			
	for(let i = 0;i < 6;i ++){
		food[i * 2] = food[i * 2] * size - init_offset;
		food[i * 2 + 1] = food[i * 2 + 1] * size + init_offset;
	}
		
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(food), gl.STATIC_DRAW);
	}

		
	
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexPosition,
		2,
		gl.FLOAT,
		false,
		8,
		0,
	);


	gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

	return VAO;
}