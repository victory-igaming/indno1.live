async function YoutubeVideo({srcurl}:any){

     let srcSetUrl = null;
     //srcSetUrl = srcurl.replace("watch?v=", "embed/") 
    const videoIdMatch = srcurl.match(/[?&]v=([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
          srcSetUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`
    }
     
   return (
     <section>
        {
            srcSetUrl && (
            <iframe src={srcSetUrl} allowFullScreen name="IndNo1" title="IndNo1"  className="flex  max-w-full"/> 
            )
        }
        
    </section>
   )
}

export default YoutubeVideo;