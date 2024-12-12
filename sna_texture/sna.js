


//  初始化着色器程序，让 WebGL 知道如何绘制我们的数据
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // 创建着色器程序

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // 如果创建失败，alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram),
    );
    return null;
  }

  return shaderProgram;
}

//
// 创建指定类型的着色器，上传 source 源码并编译
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}









function main() {
	const canvas = document.querySelector("#glcanvas");

	const gl = canvas.getContext("webgl2");


	if (!gl) {
		alert("无法初始化 WebGL2，你的浏览器、操作系统或硬件等可能不支持 WebGL2。");
		return;
	}

	gl.viewport(0, 0, screen_width, screen_height);
	
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST); // Enable depth testing
	gl.depthFunc(gl.LEQUAL); // Near things obscure far things
	

	//编译链接着色器
	const shaderProgram_pic = initShaderProgram(gl, vertex_pic_source, fragment_pic_source);
	const shaderProgram_food = initShaderProgram(gl, vertex_food_source, fragment_food_source);

	//顶点属性
	const programInfo_pic = {
		program: shaderProgram_pic,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram_pic, "aPos"),
			coordPosition: gl.getAttribLocation(shaderProgram_pic, "coord"),//纹理坐标
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram_pic, "pers"),
			uSampler: gl.getUniformLocation(shaderProgram_pic, "uSampler"),//纹理采样 

		},
	};
	
	//顶点属性
	const programInfo_food = {
		program: shaderProgram_food,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram_food, "aPos"),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram_food, "pers"),
		},
	};
	
	//顶点数组设置
	const num_row = 16;
	const num_row_pixel = num_row * 4;
	const VAO_pic = pic_vao_gen(gl, programInfo_pic);
	const VAO_food = food_vao_gen(gl, programInfo_food, num_row);


	const length_init = 4;//初始长度 不包括头部 总共占用n+1个格子
	const loca_init = num_row / 2;//初始位置
	let length_sna;

	let array_detect = [];//用于判断位置的数组 指示前一个位置的方向
	let array_pixel = [];
	
	let loca_head;
	let loca_tail;
	let direction;//前进方向
	let last_element;//上一个前进方向 不能回头
	let control_element;//根据方向准备填入数组的元素
	let loca_food;//食物位置
	
	//食物位置生成函数
	function food_gen(){
		const num_spare = num_row * num_row - length_sna - 1;
		const rand_food = Math.floor(Math.random() * num_spare);
		let loca_food_tmp = [0, 0];
		let cnt = 0;
		for(let i = 0;i < num_row;i ++){
			for(let j = 0;j < num_row;j ++){
				if(cnt == rand_food && array_detect[i * num_row + j] == 0){
					loca_food_tmp = [j, i];
					return loca_food_tmp;
				}
				if(array_detect[i * num_row + j] == 0){
					cnt ++;
				}
			}
		}
		
		return [0, 0];
	}

	//初始化函数
	function init_parameter(){
		length_sna = length_init
		loca_head = [loca_init , loca_init];
		loca_tail = [loca_init + length_init, loca_init];
		direction = [-1, 0];//前进方向
		last_element = 3;//上一个前进方向 不能回头
		control_element = 3;//根据方向准备填入数组的元素
		
		for(let i = 0;i < num_row * num_row;i ++){
			let element = 0;
		
			if(i >= loca_head[0] + loca_head[1] * num_row && i <= loca_tail[0] + loca_tail[1] * num_row)
				element = 3;
		
			array_detect[i] = element;
		}
		
		for(let i = 0;i < num_row_pixel * num_row_pixel;i ++){
			array_pixel[i] = 0;
		}
		//初始像素生成
		for(let i = 0;i < length_init * 4 + 2;i ++){
			const index_tmp = loca_head[0] * 4 + loca_head[1] * num_row * 16 +
							1 + num_row_pixel;
			array_pixel[i + index_tmp] = 255;
			array_pixel[i + index_tmp + num_row_pixel] = 255;
		}
		
		//食物位置初始化
		loca_food = food_gen();
		
	}

	init_parameter();
	
	//纹理设置
	const texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	// gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	// Prevents s-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// Prevents t-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	

	const step_t = 10;//每隔多少帧更新
	let current_step = 0;
	function render(now) {


		
		
		//按键控制
		if(w_down == 1 && last_element != 4){
			direction = [0, -1];
			control_element = 2;
		}
			
		if(s_down == 1 && last_element != 2){
			direction = [0, 1];
			control_element = 4;
		}
			
		if(a_down == 1 && last_element != 1){
			direction = [-1, 0];
			control_element = 3;
		}
			
		if(d_down == 1 && last_element != 3){
			direction = [1, 0];
			control_element = 1;
		}

		//根据时间判断是否更新
		if(current_step == step_t){
			
		current_step = 0;
		//上一个方向 更新
		last_element = control_element;
	
		
		

		//拾取检测
		let if_eat = 0;
		if(loca_food[0] == loca_head[0] + direction[0] && loca_food[1] == loca_head[1] + direction[1]){
			if_eat = 1;
		}
			
		
		//尾部更新
		if(if_eat == 0){
			let dir_tail = array_detect[loca_tail[0] + loca_tail[1] * num_row];
			array_detect[loca_tail[0] + loca_tail[1] * num_row] = 0;//清空
			
			let loca_tail_change = [0, 0];
			switch(dir_tail){
				case 1:
					//loca_tail[0] ++;
					loca_tail_change[0] =1;
					break;
				case 2:
					//loca_tail[1] --;
					loca_tail_change[1] = -1;
					break;
				case 3:
					//loca_tail[0] --;
					loca_tail_change[0] = -1;
					break;
				case 4:
					//loca_tail[1] ++;
					loca_tail_change[1] = 1;
					break;
			}
			//像素更新
			const loca_partial_tail = loca_tail[0] * 4 + loca_tail[1] * num_row * 16;
			array_pixel[loca_partial_tail + 1 + num_row_pixel] = 0;
			array_pixel[loca_partial_tail + 2 + num_row_pixel] = 0;
			array_pixel[loca_partial_tail + 1 + num_row_pixel * 2] = 0;
			array_pixel[loca_partial_tail + 2 + num_row_pixel * 2] = 0;
		
			array_pixel[loca_partial_tail + 1 + num_row_pixel + loca_tail_change[0] * 2 + loca_tail_change[1] * num_row_pixel * 2] = 0;
			array_pixel[loca_partial_tail + 2 + num_row_pixel + loca_tail_change[0] * 2 + loca_tail_change[1] * num_row_pixel * 2] = 0;
			array_pixel[loca_partial_tail + 1 + num_row_pixel * 2 + loca_tail_change[0] * 2 + loca_tail_change[1] * num_row_pixel * 2] = 0;
			array_pixel[loca_partial_tail + 2 + num_row_pixel * 2 + loca_tail_change[0] * 2 + loca_tail_change[1] * num_row_pixel * 2] = 0;
			
			//tail位置更新
			loca_tail[0] += loca_tail_change[0];
			loca_tail[1] += loca_tail_change[1];
		}
		
		
		//头部数组更新
		//let index_cur_head = loca_head[0] + loca_head[1] * num_row;//当前头部位置索引
		array_detect[loca_head[0] + loca_head[1] * num_row] = control_element;
		//头更新
		loca_head[0] += direction[0];
		loca_head[1] += direction[1];
		//边界检测
		if(loca_head[0] < 0 || loca_head[0] >= num_row || loca_head[1] < 0 || loca_head[1] >= num_row){
			alert("wall");
			init_parameter();
		}else if(array_detect[loca_head[0] + loca_head[1] * num_row] != 0){//碰撞检测
			alert("touch");
			init_parameter();
		}
		array_detect[loca_head[0] + loca_head[1] * num_row] = 3;//占位
		//像素更新
		const loca_partial = loca_head[0] * 4 + loca_head[1] * num_row * 16;
		array_pixel[loca_partial + 1 + num_row_pixel] = 255;
		array_pixel[loca_partial + 2 + num_row_pixel] = 255;
		array_pixel[loca_partial + 1 + num_row_pixel * 2] = 255;
		array_pixel[loca_partial + 2 + num_row_pixel * 2] = 255;
		
		array_pixel[loca_partial + 1 + num_row_pixel - direction[0] * 2 - direction[1] * num_row_pixel * 2] = 255;
		array_pixel[loca_partial + 2 + num_row_pixel - direction[0] * 2 - direction[1] * num_row_pixel * 2] = 255;
		array_pixel[loca_partial + 1 + num_row_pixel * 2 - direction[0] * 2 - direction[1] * num_row_pixel * 2] = 255;
		array_pixel[loca_partial + 2 + num_row_pixel * 2 - direction[0] * 2 - direction[1] * num_row_pixel * 2] = 255;
		
		//食物位置更新
		if(if_eat == 1){
			//长度更新
			length_sna ++;
			if(length_sna == num_row * num_row - 1){
				alert("win");
				init_parameter();
			}
			//食物位置更新
			loca_food = food_gen();
		}
		
		//纹理传输
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.LUMINANCE,
			num_row_pixel,
			num_row_pixel,
			0,
			gl.LUMINANCE,
			gl.UNSIGNED_BYTE,
			new Uint8Array(array_pixel),
		);
		
		}//if语句 每隔特定步长才更新
		else{
			current_step ++;
		}
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		
		
		//渲染pic
		gl.bindVertexArray(VAO_pic);
		gl.useProgram(programInfo_pic.program);
		//透视矩阵
		const perspec = [
		screen_height/screen_width, 0.0, 0.0, 0.0, 
		0.0, 1.0, 0.0, 0.0, 
		0.0, 0.0, 1.0, 0.0, 
		0.0, 0.0, 0.0, 1.0
		];
		gl.uniformMatrix4fv(
			programInfo_pic.uniformLocations.projectionMatrix,
			false,
			new Float32Array(perspec),
		);
		gl.uniform1i(programInfo_pic.uniformLocations.uSampler, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		
		
		//渲染food
		gl.bindVertexArray(VAO_food);
		gl.useProgram(programInfo_food.program);
		const move = [
		1.0, 0.0, 0.0, 0.0, 
		0.0, 1.0, 0.0, 0.0, 
		0.0, 0.0, 1.0, 0.0, 
		2*loca_food[0]/num_row, 2*-loca_food[1]/num_row, 0.0, 1.0
		];

		
		let matrix_food = mul_matrix(perspec, move);
		gl.uniformMatrix4fv(
			programInfo_food.uniformLocations.projectionMatrix,
			false,
			new Float32Array(matrix_food),
		);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		

		requestAnimationFrame(render);
	}
	
	requestAnimationFrame(render);
}



let w_down = 0;
let s_down = 0;
let a_down = 0;
let d_down = 0;
let q_down = 0;
let e_down = 0;
let f_down = 0;
function handle_keydown(event){
	switch(event.code){
		case "KeyW":
		w_down = 1;
		//position_move(move_speed, 0, angle_xz);
		
		break;
		case "KeyS":
		s_down = 1;
		//position_move(-move_speed, 0, angle_xz);
		break;
		case "KeyA":
		a_down = 1;
		//position_move(0, move_speed, angle_xz);
		break;
		case "KeyD":
		d_down = 1;
		//position_move(0, -move_speed, angle_xz);
		break;
		//增加上升和下降
		case "KeyQ":
		q_down = 1;
		//position_move(0, -move_speed, angle_xz);
		break;
		case "KeyE":
		e_down = 1;
		//position_move(0, -move_speed, angle_xz);
		break;
		case "KeyF":
		f_down = 1;
		//position_move(0, -move_speed, angle_xz);
		break;
	}
}

function handle_keyup(event){
	switch(event.code){
		case "KeyW":
		w_down = 0;
		
		break;
		case "KeyS":
		s_down = 0;
		break;
		case "KeyA":
		a_down = 0;
		break;
		case "KeyD":
		d_down = 0;
		break;
		//
		case "KeyQ":
		q_down = 0;
		break;
		case "KeyE":
		e_down = 0;
		break;
		case "KeyF":
		f_down = 0;
		break;
	}
}

//像素大小初始化
let screen_width = window.innerWidth;
document.querySelector("#glcanvas").width = screen_width;

let screen_height = window.innerHeight;
document.querySelector("#glcanvas").height = screen_height;

//事件监听
document.addEventListener("DOMContentLoaded", main);

window.addEventListener("keydown", handle_keydown);
window.addEventListener("keyup", handle_keyup);

