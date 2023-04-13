import weaviate from 'weaviate-ts-client';
import * as fs from 'fs';

const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080'
});

const schemaRes = await client.schema.getter().do();
console.log(schemaRes)

const schemaConfig = {
    'class': 'MemeTemps103',
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
const img = fs.readFileSync('./img/buzz-lightyear-store-meme.jpg');
const b64 = Buffer.from(img).toString('base64');
const res = await client.data.creator()
    .withClassName('MemeTemps103')
    .withProperties({
        image: b64,
        text: 'buzz lightyear store clones meme'
    })
    .do();


//uploading all images
/*const imgFiles = readdir('./img')
const promises = imgFiles.map(async (imgFile) =>{
    const b64 = toBase64(`./img/${imgFile}`);

    await client.data.creator()
    .withClassName('MemeTemp')
    .withProperties({
        image: b64,
        text: imgFile.split('.')[0].split('_').join(' ')
    })
    .do();
})

await Promise.all(promises);
*/

//quering an image
const test = Buffer.from( fs.readFileSync('./test.jpg') ).toString('base64');

const resImage = await client.graphql.get()
    .withClassName('MemeTemps103')
    .withFields(['image'])
    .withNearImage({ image: test })
    .withLimit(1)
    .do();

//writing the result back to the file system to see the image result visually
const result = resImage.data.Get.MemesTemps103[0].image;
writeFileSync( './result.jpg', result, 'base64' );
