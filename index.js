import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080'
});

const schemaRes = await client.schema.getter().do();
console.log(schemaRes)

const schemaConfig = {
    'class': 'Memes',
    'vectorizer': 'img2vec-neural',
    'vectorIndexType': 'hnsw',
    'moduleConfig':{
        'imageFields':[
            'image'
        ]
    },
    'properties':[
        {
            'name': 'image',
            'dataType': ['blob']
        },
        {
            'name': 'text',
            'dataType': ['string']
        }
    ]
}

await client.schema
    .classCreator()
    .withClass(schemaConfig)
    .do();

//storing an image
/*const img = readFileSync('./img/buzzlightyearstore.jpg');
const b64 = Buffer.from(img).toString('base64');
const res = await client.data.creator()
    .withClassName('Memes')
    .withProperties({
        image: b64,
        text: 'buzz lightyear in the store'
    })
    .do();
*/

//uploading all images
const imgFiles = readdirSync('./img')
const promises = imgFiles.map(async (imgFile) =>{
    const b64 = toBase64(`./img/${imgFile}`);

    await client.data.creator()
    .withClassName('Memes')
    .withProperties({
        image: b64,
        text: imgFile.split('.')[0].split('_').join(' ')
    })
    .do();
})

await Promise.all(promises);


//quering an image
const test = Buffer.from( readFileSync('./test.jpg') ).toString('base64');

const resImage = await client.graphql.get()
    .withClassName('Memes')
    .withFields(['image'])
    .withNearImage({ image: test })
    .withLimit(1)
    .do();

//writing the result back to the file system to see the image result visually
const result = resImage.data.Get.Memes[0].image;
writeFileSync( './result.jpg', result, 'base64' );
