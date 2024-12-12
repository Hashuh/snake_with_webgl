//着色器代码


	
const vertex_pic_source = `#version 300 es
	precision mediump float;

	in vec2 aPos;
	in vec2 coord;
	out vec2 coord_frag;
	
	uniform mat4 pers;
	//uniform mat4 rota_move;
	
	
	void main()
	{
		coord_frag = coord;
		gl_Position = pers * vec4(aPos, 0.1, 1.0);
	}
	
	`;
	
const fragment_pic_source = `#version 300 es
	precision mediump float;

	in vec2 coord_frag;
	
	out vec4 FragColor;
	
	uniform sampler2D uSampler;//纹理采样

	void main()
	{
		
		FragColor = vec4(vec3(texture(uSampler, coord_frag).x), 1.0);
	}
	
	`;
	
	
//渲染纯色圆	
const vertex_food_source = `#version 300 es
	precision mediump float;

	in vec2 aPos;
	
	uniform mat4 pers;

	void main()
	{
		gl_Position = pers * vec4(aPos, 0.0, 1.0);
	}
	
	`;
	
const fragment_food_source = `#version 300 es
	precision mediump float;
	
	out vec4 FragColor;

	void main()
	{
		
		FragColor = vec4(1.0);
	}
	
	`;
	
