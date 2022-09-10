import k8s from '@kubernetes/client-node'
import util from 'node:util'
import child_process from 'node:child_process'

const exec = util.promisify(child_process.exec)

const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sApi = kc.makeApiClient(k8s.CoreV1Api)

// Отримуємо всі PVC
const pvc = await k8sApi.listPersistentVolumeClaimForAllNamespaces()

// Запитуємо деталі про PVC
for (const p of pvc.body.items) {
  const { stdout } = await exec(`kubectl describe pvc ${p.metadata.name} -n ${p.metadata.namespace} `)

  // Ті які не використовуються
  if (stdout.includes('Used By:       <none>')) {
    k8sApi.deleteNamespacedPersistentVolumeClaim(p.metadata.name, p.metadata.namespace)
    console.log(p.metadata.name)
  }
}
