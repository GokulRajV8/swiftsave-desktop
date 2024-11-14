// Extracting data from webpage
const pagePath = (window.location.pathname.endsWith('/')) ? window.location.pathname.slice(0, -1) : window.location.pathname;
const postCodeArray = pagePath.split('/');
const mediaIds = document.querySelector('body').innerHTML.match(/\"media_id\":\"([^\"]*)\",\"media_owner_id\":\"([^\"]*)\"/);

// Populating IDs
const POST_CODE = postCodeArray[postCodeArray.length - 1];
const MEDIA_ID = mediaIds[1];
const MEDIA_OWNER_ID = mediaIds[2];

function getCookie(name) {
    return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
}

async function downloadMedia(userName, json_data, id = 0) {
    // Getting media URL and file extension
    let mediaURL = null;
    let fileExtension = null;
    if (json_data['media_type'] == 1) {
        mediaURL = json_data['image_versions2'].candidates[0].url;
        fileExtension = 'jpeg';
    } else {
        mediaURL = json_data['video_versions'][0].url;
        fileExtension = 'mp4';
    }

    // Creating blob from media URL
    const response = await fetch(mediaURL);
    const blob = await response.blob();

    // Downloading blob as file
    const a = document.createElement('a');
    a.download = userName + '_' + POST_CODE + '_' + id + '.' + fileExtension;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
}

async function downloadPost() {
    const apiURL = new URL(`/api/v1/media/${MEDIA_ID}_${MEDIA_OWNER_ID}/info`, window.location.origin);
    let json_data = null;

    // Getting media info using IDs
    try {
        const response = await fetch(apiURL.href, {
            method: 'GET',
            headers: {
                'x-csrftoken': getCookie('csrftoken'),
                'x-ig-app-id': '936619743392459',
            },
        });
        const json_raw = await response.json();
        json_data = json_raw.items[0];
    } catch (error) {
        console.error(error);
        return null;
    }

    // Downloading media using the info received
    const userName = json_data['user']['username'];
    if (json_data.carousel_media) {
        for (const id in json_data.carousel_media) {
            await downloadMedia(userName, json_data.carousel_media[id], id);
        }
    } else {
        await downloadMedia(userName, json_data);
    }
}

function createButton() {
    // Creating button and attaching click event
    const downloadSection = document.createElement('div');
    const downloadButton = document.createElement('div');
    downloadSection.style = `
    width: 44px; height: 44px; position: fixed; top: 20px; right: 20px; border-radius: 12px;
    border: 1px solid rgb(var(--ig-primary-text)); background: rgb(var(--ig-secondary-background));
    `;
    downloadButton.style = 'width: 24px; height: 24px; padding: 10px;';
    downloadButton.innerHTML = `
    <svg fill='rgb(var(--ig-primary-text))' height='24' width='24' role='img' viewBox='0 0 24 24'>
        <path d='M3 14.25C3.41421 14.25 3.75 14.5858 3.75 15C3.75 16.4354 3.75159 17.4365 3.85315 18.1919C3.9518 18.9257 4.13225
        19.3142 4.40901 19.591C4.68577 19.8678 5.07435 20.0482 5.80812 20.1469C6.56347 20.2484 7.56459 20.25 9 20.25H15C16.4354
        20.25 17.4365 20.2484 18.1919 20.1469C18.9257 20.0482 19.3142 19.8678 19.591 19.591C19.8678 19.3142 20.0482 18.9257
        20.1469 18.1919C20.2484 17.4365 20.25 16.4354 20.25 15C20.25 14.5858 20.5858 14.25 21 14.25C21.4142 14.25 21.75 14.5858
        21.75 15V15.0549C21.75 16.4225 21.75 17.5248 21.6335 18.3918C21.5125 19.2919 21.2536 20.0497 20.6517 20.6516C20.0497
        21.2536 19.2919 21.5125 18.3918 21.6335C17.5248 21.75 16.4225 21.75 15.0549 21.75H8.94513C7.57754 21.75 6.47522 21.75
        5.60825 21.6335C4.70814 21.5125 3.95027 21.2536 3.34835 20.6517C2.74643 20.0497 2.48754 19.2919 2.36652 18.3918C2.24996
        17.5248 2.24998 16.4225 2.25 15.0549C2.25 15.0366 2.25 15.0183 2.25 15C2.25 14.5858 2.58579 14.25 3 14.25Z M12 16.75C12.2106
        16.75 12.4114 16.6615 12.5535 16.5061L16.5535 12.1311C16.833 11.8254 16.8118 11.351 16.5061 11.0715C16.2004 10.792 15.726
        10.8132 15.4465 11.1189L12.75 14.0682V3C12.75 2.58579 12.4142 2.25 12 2.25C11.5858 2.25 11.25 2.58579 11.25 3V14.0682L8.55353
        11.1189C8.27403 10.8132 7.79963 10.792 7.49393 11.0715C7.18823 11.351 7.16698 11.8254 7.44648 12.1311L11.4465 16.5061C11.5886
        16.6615 11.7894 16.75 12 16.75Z'/>
    </svg>
    `;
    document.body.appendChild(downloadSection);
    downloadSection.appendChild(downloadButton);
    downloadSection.addEventListener('click', downloadPost);
}

// Creating button
createButton();
