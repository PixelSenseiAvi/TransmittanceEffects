#version 330

layout (location = 0) in vec3 pos;

out vec3 TexCoords;

uniform mat4 projection;
uniform mat4 view;

void main()
{
	//mat4 inverseProjection = inverse(projection);
	//mat3 inverseView = transpose(mat3(view));
	//vec3 unprojected = (inverseProjection * pos).xyz;

	TexCoords = pos.xyz;
	//inverseView * unprojected;
	gl_Position = projection * view * vec4(pos, 1.0);

}