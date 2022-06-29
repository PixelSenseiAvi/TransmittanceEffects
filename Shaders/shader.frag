#version 330

in vec4 vCol;
in vec2 TexCoord;
in vec3 Normal;
in vec3 FragPos;

out vec4 colour;

//Randomly defining light pos !!Assign through uniform variable later 
vec3 LightPos = vec3(1.0, 1.0f, 1.2f);

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
	float Ratio = F + (1.0 - F)*pow((1.0-max(0,dot(-I, Normal))), 5.0);
	vec3 outcolor = mix(calcRefraction(), calcReflection(), 0.4);

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
	
	outcolor = mix(outcolor, calcReflection(), Ratio);
	return outcolor;
}


void main()
{

	//Phong 
	// ambient
    float ambientStrength = 0.7;
    vec3 ambient = ambientStrength * texture(theTexture, TexCoord).rgb;
	//lightColor;    
    
     // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(LightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * texture(theTexture, TexCoord).rgb;
    
    // specular
    float specularStrength = 0.5;
    vec3 viewDir = normalize(-FragPos); // the viewer is always at (0,0,0) in view-space, so viewDir is (0,0,0) - Position => -Position
    vec3 reflectDir = reflect(-lightDir, norm);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
    vec3 specular = specularStrength * spec * texture(theTexture, TexCoord).rgb; 

	vec3 result = (ambient +diffuse + specular);

	//colour = vec4(calcReflection(), 1.0);

	colour = vec4(result, 1.0);
}