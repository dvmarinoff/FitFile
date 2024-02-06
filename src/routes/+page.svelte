<script>
import { fit } from '$lib/fit/fit.js';
import { isArray, isObject, fileHandler } from '$lib/functions.js';

let files;

$: if(files) { onFile(files[0]) }

let fitjs = [];

async function onFile(file) {
    const buffer = await fileHandler.readBinary(file);
    const view = new DataView(buffer);
    fitjs = fit.FITjs.decode(view);
    // console.log(fitjs);
}

function onInspect() {
    if(fitjs?.length ?? 0 > 0) {
        console.log(fitjs);
    }
}

</script>

<div class="wrapper">
    <header class="header--cont">
        <svg xmlns="http://www.w3.org/2000/svg"
            enable-background="new 0 0 24 24"
            height="24px" viewBox="0 0 24 24" width="24px" fill="#007bc2">
            <g>
                <path d="M0,0h24v24H0V0z" fill="none"/>
            </g>
            <g>
                <path d="M14,2H4v20h16V8L14,2z M10.94,18L7.4,14.46l1.41-1.41l2.12,2.12l4.24-4.24l1.41,1.41L10.94,18z M13,9V3.5L18.5,9H13z"/>
            </g>
        </svg>
        <h1 class="h1">fit file</h1>

        <div class="controls"></div>
    </header>

    <section class="upload--section">
        <h2 class="upload--header">Upload Activity:</h2>

        <!-- upload -->
        <div id="upload" class="upload">
            <div class="upload--cont">
                <input
                    id="upload--input"
                    class="upload--input"
                    name="upload--input"
                    type="file"
                    value=""
                    accept=".fit"
                    bind:files
                />
            </div>
        </div> <!-- end upload -->
    </section>

    <section class="controls--section">
        <button class="control--button inspect" on:click={onInspect}>
            Inspect
        </button>
    </section>

    <section class="display">
        {#if fitjs?.length ?? 0 > 0}
	          {#each fitjs as record, i}
                <div class="record--cont">
                    <div class="record--meta">
                        {record.name ?? ''} {record.type}
                    </div>
                    <div class="record--fields">
                        {#if isArray(record.fields)}
	                          {#each record.fields as field, i}
                                <div class="field">
                                    {#each Object.entries(field) as field, i}
                                        <div class="field--member">
                                            <div class="field--name">
                                                {field[0]}
                                            </div>
                                            <div class="field--value">
                                                {field[1]}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
	                          {/each}
                        {/if}
                        {#if isObject(record.fields)}
                            <div class="field">
	                              {#each Object.entries(record.fields) as field, i}
                                    <div class="field--member">
                                            <div class="field--name">
                                                {field[0]}
                                            </div>
                                            <div class="field--value">
                                                {field[1]}
                                            </div>
                                        </div>
	                              {/each}
                            </div>
                        {/if}

                    </div>
                </div>
	          {/each}
        {/if}
    </section>
</div>

<style>
.wrapper {
}
.header--cont {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    align-content: center;

    font-size: 1rem;
    width: 100%;
    padding: 1em 1.5em 1em 1.5em;
    text-align: center;

    color: #fff;
    background-color: #35363a;
}
.header--cont svg {
    margin-right: 1.5em;
    align-self: flex-start;
}

.upload--cont {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    height: 180px;
    text-align: center;

    border: 2px dashed rgba(255,255,255, 0.1);
}
.upload--header {
    text-align: center;
    margin: 1em;
}
.controls--section {
    display: flex;
    align-items: center;
    justify-content: center;

    margin: 2em 1em;
}

.display {
    padding: 1em;
}
.record--meta {
    font-size: 1rem;
}

.record--fields {
    color: #aaa;
    font-size: 0.8rem;
}
.field {
    display: flex;
    margin-left: 1em;
    padding-bottom: 1em;

    overflow-x: scroll;
}
.field--member {
    padding: 0 0.3em;
}
</style>

