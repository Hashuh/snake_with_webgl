
//矩阵乘法
function mul_matrix(a, b){
	//a b列主序4*4矩阵 结果是矩阵乘法a*b
	let result = [];
	
	//循环中 col row 表示矩阵列与行索引 区分列主序的矩阵表示方式
	for(let col = 0;col < 4;col += 1){
		for(let row = 0;row < 4;row += 1){
			result[col * 4 + row] = a[row] * b[col * 4 + 0] 
							+ a[4 + row] * b[col * 4 + 1]
							+ a[4 * 2 + row] * b[col * 4 + 2]
							+ a[4 * 3 + row] * b[col * 4 + 3];
		}
	}
	
	return result;
}