<template>
  <div class="container" v-if="hasCode">
    <IconButton
      v-if="canRun"
      text="Run"
      v-on:click="executeCode"
      icon-prefix="fas"
      icon-name="play"
    />
    <IconButton
      :text="isDesktopVersion ? 'Save' : 'Download'"
      v-on:click="saveCode"
      icon-prefix="fas"
      :icon-name="isDesktopVersion ? 'save' : 'file-download'"
    />
    <IconButton
      text="Copy"
      v-on:click="copyCode"
      icon-prefix="fas"
      icon-name="copy"
    />
    <ModalDialog v-if="instructions" v-model="areInstructionsVisible">
      <InstructionList :data="instructions" />
    </ModalDialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, inject,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { SaveFileDialog, FileType } from '@/infrastructure/SaveFileDialog';
import { Clipboard } from '@/infrastructure/Clipboard';
import ModalDialog from '@/presentation/components/Shared/Modal/ModalDialog.vue';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CodeRunner } from '@/infrastructure/CodeRunner';
import { IReadOnlyApplicationContext } from '@/application/Context/IApplicationContext';
import InstructionList from './Instructions/InstructionList.vue';
import IconButton from './IconButton.vue';
import { IInstructionListData } from './Instructions/InstructionListData';
import { getInstructions, hasInstructions } from './Instructions/InstructionListDataFactory';

export default defineComponent({
  components: {
    IconButton,
    InstructionList,
    ModalDialog,
  },
  setup() {
    const {
      currentState, currentContext, onStateChange,
    } = inject(InjectionKeys.useCollectionState)();
    const { os, isDesktop } = inject(InjectionKeys.useRuntimeEnvironment);
    const { events } = inject(InjectionKeys.useAutoUnsubscribedEvents)();

    const areInstructionsVisible = ref(false);
    const canRun = computed<boolean>(() => getCanRunState(currentState.value.os, isDesktop, os));
    const fileName = computed<string>(() => buildFileName(currentState.value.collection.scripting));
    const hasCode = ref(false);
    const instructions = computed<IInstructionListData | undefined>(() => getDownloadInstructions(
      currentState.value.collection.os,
      fileName.value,
    ));

    async function copyCode() {
      const code = await getCurrentCode();
      Clipboard.copyText(code.current);
    }

    function saveCode() {
      saveCodeToDisk(fileName.value, currentState.value);
      areInstructionsVisible.value = true;
    }

    async function executeCode() {
      await runCode(currentContext);
    }

    onStateChange((newState) => {
      updateCurrentCode(newState.code.current);
      subscribeToCodeChanges(newState.code);
    }, { immediate: true });

    function subscribeToCodeChanges(code: IApplicationCode) {
      events.unsubscribeAllAndRegister([
        code.changed.on((newCode) => updateCurrentCode(newCode.code)),
      ]);
    }

    function updateCurrentCode(code: string) {
      hasCode.value = code && code.length > 0;
    }

    async function getCurrentCode(): Promise<IApplicationCode> {
      const { code } = currentContext.state;
      return code;
    }

    return {
      isDesktopVersion: isDesktop,
      canRun,
      hasCode,
      instructions,
      fileName,
      areInstructionsVisible,
      copyCode,
      saveCode,
      executeCode,
    };
  },
});

function getDownloadInstructions(
  os: OperatingSystem,
  fileName: string,
): IInstructionListData | undefined {
  if (!hasInstructions(os)) {
    return undefined;
  }
  return getInstructions(os, fileName);
}

function getCanRunState(
  selectedOs: OperatingSystem,
  isDesktopVersion: boolean,
  hostOs: OperatingSystem,
): boolean {
  const isRunningOnSelectedOs = selectedOs === hostOs;
  return isDesktopVersion && isRunningOnSelectedOs;
}

function saveCodeToDisk(fileName: string, state: IReadOnlyCategoryCollectionState) {
  const content = state.code.current;
  const type = getType(state.collection.scripting.language);
  SaveFileDialog.saveFile(content, fileName, type);
}

function getType(language: ScriptingLanguage) {
  switch (language) {
    case ScriptingLanguage.batchfile:
      return FileType.BatchFile;
    case ScriptingLanguage.shellscript:
      return FileType.ShellScript;
    default:
      throw new Error('unknown file type');
  }
}
function buildFileName(scripting: IScriptingDefinition) {
  const fileName = 'privacy-script';
  if (scripting.fileExtension) {
    return `${fileName}.${scripting.fileExtension}`;
  }
  return fileName;
}

async function runCode(context: IReadOnlyApplicationContext) {
  const runner = new CodeRunner();
  await runner.runCode(
    /* code: */ context.state.code.current,
    /* appName: */ context.app.info.name,
    /* fileExtension: */ context.state.collection.scripting.fileExtension,
  );
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.container > * + * {
  margin-left: 30px;
}
</style>
