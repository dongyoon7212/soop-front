import { css } from "@emotion/react";

export const addFeedRootLayout = css`
    /* position: fixed;
    z-index: 999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #33333399; */
`;

export const addFeedLayout = css`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 700px;
    background-color: #fafafa;
`;

export const addFeedHeader = css`
    position: absolute;
    top: 20px;
    height: 50px;
    width: 660px;
    background-color: #f3c1c1;
`;
export const addFeedProfileImg = css`
    box-sizing: border-box;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    background-color: #333333;
`;

export const addFeedContents = css`
    height: 600px;
`;

export const addFeedImgPrievew = css`
    position: relative;
    margin-top: 10px;
    flex-grow: 1;
    justify-content: flex-start;
    width: 660px;
    height: 200px;
    overflow: hidden;
    overflow: auto;
`;

export const addFeedImage = css`
    width: 50%;
    flex-grow: 1;
    button {
        position: absolute;
        top: 0;
        right: 0;
    }
`

export const addFeedQuill = css`
    height: 380px;
    width: 660px;
    overflow: auto;
`;

export const addFeedFooter = css`
    margin-top: 20px;
    width: 660px;
    height: 50px;
    &>button{
        cursor: pointer;
    }

`;