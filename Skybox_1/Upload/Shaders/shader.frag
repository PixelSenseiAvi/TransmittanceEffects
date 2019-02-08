#version 330

in vec4 vCol;
in vec2 TexCoord;
in vec3 Normal;
in vec3 FragPos;

out vec4 colour;


struct Material
{
	float specularIntensity;
	float shininess;
};

uniform sampler2D theTexture;

uniform Material material;
uniform samplerCube skybox;

uniform vec3 eyePosition;


vec3 calcReflection(){

	vec3 I = normalize(FragPos - eyePosition);
    vec3 R = reflect(I, normalize(Normal));
	vec3 outcolor = vec3(texture(skybox, R).rgb);

	return outcolor;
}

// refer https://www.scss.tcd.ie/Michael.Manzke/CS7055/GLSL/GLSL-3rdEd-refraction.pdf
const float ratio = 1.00/1.52;
const float FresnelPower = 5.0;

const float F = ((1.0 - ratio) * (1.0 - ratio)) / ((1.0+ratio)*(1.0+ratio));

vec3 calcRefraction(){
	vec3 I = normalize(FragPos - eyePosition);
    vec3 R = refract(I, normalize(-Normal), ratio);
	vec3 outcolor = vec3(texture(skybox, R).rgb);

	return outcolor;
}

vec3 calcFresnel(){
	vec3 I = normalize(FragPos - eyePosition);
	float Ratio = F + (1.0 - F)*pow((1.0-max(0.0,dot(-I, Normal))), 5.0);
	vec3 outcolor = mix(calcReflection(), calcRefraction(), Ratio);

	return outcolor;
}

vec3 calcDispersion(){

	const float etaR = 1.14;
	const float etaG = 1.12;
	const float etaB = 1.10;
	const float fresnelPower = 5.0;
	const float F = ((1.0 - etaG) * (1.0 - etaG)) / ((1.0 + etaG) * (1.0 + etaG));

	vec3 I = normalize(FragPos - eyePosition);
	vec3 refractVecR = refract(I, normalize(-Normal), etaR);
	vec3 refractVecG = refract(I, normalize(-Normal), etaG);
	vec3 refractVecB = refract(I, normalize(-Normal), etaB);

	vec3 outcolor;
	outcolor.x = texture(skybox, refractVecR).r;
	outcolor.y = texture(skybox, refractVecG).g;
	outcolor.z = texture(skybox, refractVecB).b;
	float Ratio = F + (1.0 - F)*pow((1.0-max(0.0,dot(-I, Normal))), fresnelPower);
	
	outcolor = mix(outcolor, calcReflection(), 0.6);
	return outcolor;
}


void main()
{
	colour = vec4(calcReflection(), 1.0);
}